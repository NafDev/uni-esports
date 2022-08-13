import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { CreateTeamDto, InvitePlayerDto, TeamDto } from '@uni-esports/interfaces';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import appConfig from '../../config/app.config';
import { classifyPrismaError, PrismaError } from '../../db/prisma/prisma.errors';
import { PrismaService } from '../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../email/smtp.service';
import { createToken } from '../../util/utility';

const TEAM_PUBLIC_DTO_SELECT = {
	id: true,
	name: true,
	university: { select: { name: true } },
	UserOnTeam: { select: { captain: true, user: { select: { id: true, username: true } } } }
};

@Injectable()
export class TeamService {
	private readonly logger = new Logger(TeamService.name);

	constructor(private readonly prisma: PrismaService, private readonly smtpService: SmtpService) {}

	async findTeamsByUni(universityId: number, page: number): Promise<TeamDto[]> {
		const teams = await this.prisma.team.findMany({
			where: {
				active: true,
				universityId
			},
			select: TEAM_PUBLIC_DTO_SELECT,
			take: 10,
			skip: 10 * (page - 1)
		});

		return teams.map((team) => ({
			id: team.id,
			name: team.name,
			university: team.university.name,
			members: team.UserOnTeam.map((user) => ({
				id: user.user.id,
				username: user.user.username,
				captain: user.captain || undefined
			}))
		}));
	}

	async findTeamsByPlayer(userId: string): Promise<TeamDto[]> {
		const teams = await this.prisma.userOnTeam.findMany({
			where: { userId, team: { active: true } },
			select: { team: { select: TEAM_PUBLIC_DTO_SELECT } }
		});

		return teams.map((userOnTeam) => ({
			id: userOnTeam.team.id,
			name: userOnTeam.team.name,
			university: userOnTeam.team.university.name,
			members: userOnTeam.team.UserOnTeam.map((user) => ({
				id: user.user.id,
				username: user.user.username,
				captain: user.captain || undefined
			}))
		}));
	}

	async getTeam(id: number): Promise<TeamDto> {
		const team = await this.prisma.team.findUnique({
			where: { id },
			select: TEAM_PUBLIC_DTO_SELECT
		});

		if (!team) {
			throw new NotFoundException();
		}

		const dto: TeamDto = {
			id: team.id,
			name: team.name,
			members: team.UserOnTeam.map((user) => ({
				id: user.user.id,
				username: user.user.username,
				captain: user.captain || undefined
			})),
			university: team.university.name
		};

		return dto;
	}

	async getTeamInviteCode(id: number, session: SessionContainer) {
		const team = await this.prisma.team.findUnique({
			where: { id },
			select: {
				inviteCode: true,
				UserOnTeam: { where: { captain: true }, select: { userId: true } }
			}
		});

		if (!team) throw new NotFoundException();

		if (team?.UserOnTeam.at(0)?.userId !== session.getUserId()) {
			throw new UnauthorizedException();
		}

		return { inviteCode: team.inviteCode };
	}

	async createTeam(body: CreateTeamDto, session: SessionContainer): Promise<TeamDto> {
		const { teamName } = body;

		const userUni = await this.prisma.user.findUnique({
			where: { id: session.getUserId() },
			select: { universityId: true }
		});

		if (!userUni || !userUni.universityId) {
			throw new BadRequestException('You are not part of a university');
		}

		try {
			const team = await this.prisma.team.create({
				data: {
					name: teamName,
					inviteCode: createToken(10),
					universityId: userUni.universityId,
					UserOnTeam: {
						create: { captain: true, userId: session.getUserId() }
					}
				},
				select: TEAM_PUBLIC_DTO_SELECT
			});

			this.logger.log(`User ${session.getUserId()} created team "${teamName}"`);

			const dto: TeamDto = {
				id: team.id,
				name: team.name,
				members: team.UserOnTeam.map((user) => ({
					id: user.user.id,
					username: user.user.username,
					captain: user.captain || undefined
				})),
				university: team.university.name
			};

			return dto;
		} catch (error: unknown) {
			const [prismaError] = classifyPrismaError(error);

			if (prismaError === PrismaError.CONSTRAINT_FAILED) {
				throw new BadRequestException('There is already an active team in your university with that name');
			}

			throw error;
		}
	}

	async invitePlayerBySearch(teamId: number, inviteBySearch: InvitePlayerDto, session: SessionContainer) {
		const captain = await this.prisma.userOnTeam.findUnique({
			where: { userId_teamId: { teamId, userId: session.getUserId() } },
			select: { captain: true, team: { select: { universityId: true, inviteCode: true, name: true } } }
		});

		if (!captain || !captain.captain) {
			throw new UnauthorizedException('Only the team captain can perform this action');
		}

		const uniId = captain.team.universityId;
		const teamName = captain.team.name;
		const teamInviteCode = captain.team.inviteCode;
		const playerQuery = inviteBySearch.invitedPlayer;

		const player = playerQuery.includes('@')
			? await this.prisma.user.findUnique({
					where: { email: playerQuery.toLowerCase() },
					select: { email: true, universityId: true }
			  })
			: await this.prisma.user.findUnique({
					where: { username: playerQuery },
					select: { email: true, universityId: true }
			  });

		if (!player || player.universityId !== uniId) {
			throw new NotFoundException('Could not find that player from your university');
		}

		if (!teamInviteCode) {
			throw new BadRequestException('Cannot invite player to this team');
		}

		await this.smtpService.sendEmail(player.email, `Invite to join team ${teamName}`, EmailTemplates.TEAM_INVITE, {
			teamName,
			link: `${appConfig.WEB_DOMAIN}/teams/join?code=${teamInviteCode}`
		});
	}

	async joinPlayerOnTeam(inviteCode: string, session: SessionContainer) {
		const [user, team] = await Promise.all([
			this.prisma.user.findUnique({ where: { id: session.getUserId() }, select: { universityId: true } }),

			this.prisma.team.findFirst({
				where: { inviteCode },
				select: {
					id: true,
					TeamOnTournament: { where: { tournament: { state: 'ONGOING' } } },
					UserOnTeam: { where: { captain: true }, select: { user: { select: { universityId: true } } } }
				}
			})
		]);

		if (!team || !user) {
			throw new BadRequestException('Invalid token');
		}

		if (team.TeamOnTournament.length > 0) {
			throw new BadRequestException("You cannot join this team as it's participating in an ongoing tournament");
		}

		if (team.UserOnTeam.at(0)?.user.universityId !== user.universityId) {
			throw new BadRequestException('You cannot join this team as you are not a student of the same university');
		}

		try {
			await this.prisma.userOnTeam.create({ data: { teamId: team.id, userId: session.getUserId() } });
			this.logger.log(`User ${session.getUserId()} joined team ${team.id}`);
		} catch (error: unknown) {
			const [prismaError] = classifyPrismaError(error);
			if (prismaError === PrismaError.CONSTRAINT_FAILED) {
				throw new BadRequestException('You are already a player of this team');
			}
		}
	}

	async removePlayerOnTeam(teamId: number, userId: string, session: SessionContainer) {
		const isKick = session.getUserId() !== userId;

		const userToKick = await this.prisma.userOnTeam.findUnique({
			where: { userId_teamId: { teamId, userId } },
			select: { team: { select: { UserOnTeam: true } } }
		});

		if (!userToKick) {
			throw new NotFoundException();
		}

		const teamMembers = userToKick.team.UserOnTeam;
		const captain = userToKick.team.UserOnTeam.find((user) => user.captain);

		if (isKick && captain?.userId !== session.getUserId()) {
			this.logger.warn(`Unauthorised user ${session.getUserId()} attempted to kick user ${userId} from team ${teamId}`);
			throw new UnauthorizedException();
		}

		if (teamMembers.length === 1) {
			await this.prisma.$transaction([
				this.prisma.userOnTeam.deleteMany({ where: { teamId } }),
				this.prisma.team.update({ where: { id: teamId }, data: { active: false, inviteCode: null } })
			]);

			return;
		}

		await this.prisma.userOnTeam.delete({ where: { userId_teamId: { teamId, userId } } });
	}
}
