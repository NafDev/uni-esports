import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import type { Prisma } from '@prisma/client';
import type {
	CreateTeamDto,
	InvitePlayerDto,
	ITeamListSearchItem,
	ITeamResult,
	Pagination,
	TeamDto,
	TeamListItemDto
} from '@uni-esports/interfaces';
import camelCase from 'lodash.camelcase';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { WEB_TEAM_INVITE } from '../../config/app.config';
import { classifyPrismaError, PrismaError } from '../../db/prisma/prisma.errors';
import { PrismaService } from '../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../email/smtp.service';
import { createToken, prismaPaginationSkipTake } from '../../util/utility';
import type { TeamListSearch } from '../admin/teams/teams.admin.dto';

const TEAM_PUBLIC_DTO_SELECT = {
	id: true,
	name: true,
	university: { select: { name: true } },
	users: { select: { captain: true, user: { select: { id: true, username: true } } } }
};

@Injectable()
export class TeamService {
	constructor(
		@OgmaLogger(TeamService) private readonly logger: OgmaService,
		private readonly prisma: PrismaService,
		private readonly smtpService: SmtpService
	) {}

	async findTeamsByUni(universityId: number, page: number): Promise<TeamDto[]> {
		const teams = await this.prisma.team.findMany({
			where: {
				active: true,
				universityId
			},
			select: TEAM_PUBLIC_DTO_SELECT,
			...prismaPaginationSkipTake(page, 10)
		});

		return teams.map((team) => ({
			id: team.id,
			name: team.name,
			university: team.university.name,
			members: team.users.map((user) => ({
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
			members: userOnTeam.team.users.map((user) => ({
				id: user.user.id,
				username: user.user.username,
				captain: user.captain || undefined
			}))
		}));
	}

	async getTeamListByPlayer(userId: string): Promise<TeamListItemDto[]> {
		const teams = await this.prisma.userOnTeam.findMany({
			where: { userId },
			select: { team: { select: { id: true, name: true } } },
			orderBy: { team: { createdAt: 'desc' } }
		});

		return teams.map((team) => ({
			id: team.team.id,
			name: team.team.name
		}));
	}

	async getTeamListBySearch(query: TeamListSearch, page: number): Promise<Pagination<ITeamListSearchItem>> {
		const { name, universityId } = query;
		const where: Prisma.TeamWhereInput = {};

		if (name && name.length > 0) {
			where.name = { contains: name };
		}

		if (universityId) {
			where.universityId = universityId;
		}

		const [count, teamList] = await this.prisma.$transaction([
			this.prisma.team.count({ where }),
			this.prisma.team.findMany({
				where,
				select: { id: true, name: true, universityId: true },
				orderBy: { createdAt: 'desc' },
				...prismaPaginationSkipTake(page)
			})
		]);

		return [count, teamList];
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
			university: team.university.name,
			members: team.users.map((user) => ({
				id: user.user.id,
				username: user.user.username,
				captain: user.captain || undefined
			}))
		};

		return dto;
	}

	async getTeamInviteCode(id: number, session: SessionContainer) {
		const team = await this.prisma.team.findUnique({
			where: { id },
			select: {
				inviteCode: true,
				users: { where: { captain: true }, select: { userId: true } }
			}
		});

		if (!team) throw new NotFoundException();

		if (team?.users.at(0)?.userId !== session.getUserId()) {
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
					users: {
						create: { captain: true, userId: session.getUserId() }
					}
				},
				select: TEAM_PUBLIC_DTO_SELECT
			});

			this.logger.info(`User created team`, { userId: session.getUserId(), teamName });

			const dto: TeamDto = {
				id: team.id,
				name: team.name,
				university: team.university.name,
				members: team.users.map((user) => ({
					id: user.user.id,
					username: user.user.username,
					captain: user.captain || undefined
				}))
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

		const player = await this.prisma.user.findUnique({
			where: playerQuery.includes('@') ? { email: playerQuery.toLowerCase() } : { username: playerQuery },
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
			link: `${WEB_TEAM_INVITE}?code=${teamInviteCode}`
		});
	}

	async joinPlayerOnTeam(inviteCode: string, session: SessionContainer) {
		const [user, team] = await Promise.all([
			this.prisma.user.findUnique({ where: { id: session.getUserId() }, select: { universityId: true } }),

			this.prisma.team.findFirst({
				where: { inviteCode },
				select: {
					id: true,
					tournaments: { where: { tournament: { state: 'ONGOING' } } },
					users: { where: { captain: true }, select: { user: { select: { universityId: true } } } }
				}
			})
		]);

		if (!team || !user) {
			throw new BadRequestException('Invalid token');
		}

		if (team.tournaments.length > 0) {
			throw new BadRequestException("You cannot join this team as it's participating in an ongoing tournament");
		}

		if (team.users.at(0)?.user.universityId !== user.universityId) {
			throw new BadRequestException('You cannot join this team as you are not a student of the same university');
		}

		try {
			await this.prisma.userOnTeam.create({ data: { teamId: team.id, userId: session.getUserId() } });
			this.logger.info(`User joined team`, { userId: session.getUserId(), teamId: team.id });
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
			select: { team: { select: { users: true } } }
		});

		if (!userToKick) {
			throw new NotFoundException();
		}

		const teamMembers = userToKick.team.users;
		const captain = userToKick.team.users.find((user) => user.captain);

		if (isKick && captain?.userId !== session.getUserId()) {
			this.logger.warn(`Unauthorised user attempted to kick user from team`, {
				sessionUserId: session.getUserId(),
				kickUserId: userId,
				teamId
			});
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

	async getTeamResults(teamId: number, page: number, limit: number): Promise<Pagination<ITeamResult>> {
		type TeamResults = {
			match_id: string;
			team_number: number;
			game_id: string;
			team_1_score: number;
			start_time: Date | string;
			status: string;
			full_count: number;
		};

		const data = await this.prisma.$queryRaw<TeamResults[]>`
			select 
				mt.match_id as match_id,
				m.game_id as game_id,
				mt.team_number as team_number,
				mdc.team_1_score as team_1_score,
				mdc.team_2_score as team_2_score,
				m.start_time as start_time,
				m.status as status,
				count(*) OVER() AS full_count
			from
				"match_team" mt
			inner join
				"match" m 
				on m.id = mt.match_id
				and mt.team_id = ${teamId}
				and m.status in ('Completed', 'Cancelled', 'Ongoing')
				inner join
					match_details_csgo mdc 
					on mdc.match_id = mt.match_id
			order by start_time desc
			limit ${limit} offset ${(page - 1) * limit}
		`;

		const normalisedData: ITeamResult[] = [];

		for (const row of data) {
			row.full_count = Number(row.full_count);

			const dataWithCamelKeys: Record<string, TeamResults[keyof TeamResults]> = {};
			for (const [k, v] of Object.entries(row)) {
				if (k !== 'full_count') {
					dataWithCamelKeys[camelCase(k)] = v;
				}
			}

			normalisedData.push(dataWithCamelKeys as unknown as ITeamResult);
		}

		const count = data.at(0)?.full_count ?? 0;

		return [count, normalisedData];
	}
}
