import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { WEB_TEAM_INVITE } from '../../../config/app.config';
import { classifyPrismaError, PrismaError } from '../../../db/prisma/prisma.errors';
import { PrismaService } from '../../../db/prisma/prisma.service';
import { EmailTemplates, SmtpService } from '../../../email/smtp.service';

@Injectable()
export class TeamAdminService {
	private readonly logger = new Logger(TeamAdminService.name);

	constructor(private readonly prisma: PrismaService, private readonly smtpService: SmtpService) {}

	async invitePlayer(teamId: number, userId: string, session: SessionContainer) {
		const [team, user] = await this.prisma.$transaction([
			this.prisma.team.findUnique({
				where: { id: teamId },
				select: { name: true, universityId: true, active: true, inviteCode: true }
			}),
			this.prisma.user.findUnique({
				where: { id: userId },
				select: { email: true, universityId: true }
			})
		]);

		if (!team || !team.active || !team.inviteCode) {
			throw new NotFoundException('Could not find active team');
		}

		if (!user) {
			throw new NotFoundException('Could not find user');
		}

		if (user.universityId !== team.universityId) {
			throw new BadRequestException("User is not associated with the team's university");
		}

		await this.smtpService.sendEmail(user.email, `Invite to join team ${team.name}`, EmailTemplates.TEAM_INVITE, {
			teamName: team.name,
			link: `${WEB_TEAM_INVITE}?code=${team.inviteCode}`
		});

		this.logger.log(`Admin ${session.getUserId()} sent invite to user ${userId} for team ${teamId}`);
	}

	async joinPlayerToTeam(teamId: number, userId: string, session: SessionContainer) {
		const [team, user] = await this.prisma.$transaction([
			this.prisma.team.findUnique({
				where: { id: teamId },
				select: { universityId: true, active: true }
			}),
			this.prisma.user.findUnique({
				where: { id: userId },
				select: { universityId: true }
			})
		]);

		if (!team || !team.active) {
			throw new NotFoundException('Could not find active team');
		}

		if (!user) {
			throw new NotFoundException('Could not find user');
		}

		if (user.universityId !== team.universityId) {
			throw new BadRequestException("User is not associated with the team's university");
		}

		try {
			await this.prisma.userOnTeam.create({
				data: { teamId, userId, captain: false }
			});
		} catch (error: unknown) {
			if (error instanceof PrismaClientKnownRequestError) {
				const [prismaError] = classifyPrismaError(error);
				if (prismaError === PrismaError.CONSTRAINT_FAILED) {
					throw new BadRequestException('Constraint Failed. Player is already on team?');
				}
			}
		}

		this.logger.log(`Admin ${session.getUserId()} joined player ${userId} to team ${teamId}`);
	}

	async removePlayerFromTeam(teamId: number, userId: string, session: SessionContainer) {
		const { count } = await this.prisma.userOnTeam.deleteMany({
			where: { captain: false, teamId, userId }
		});

		if (!count || count === 0) {
			throw new BadRequestException('You must change the captain of the team before you can remove this player.');
		}

		this.logger.log(`Admin ${session.getUserId()} remove user ${userId} from team ${teamId}`);
	}

	async changeCaptain(teamId: number, userId: string, session: SessionContainer) {
		try {
			await this.prisma.$transaction([
				this.prisma.userOnTeam.updateMany({
					where: { teamId, captain: true },
					data: { captain: false }
				}),
				this.prisma.userOnTeam.update({
					where: { userId_teamId: { teamId, userId } },
					data: { captain: true }
				})
			]);

			this.logger.log(`Admin ${session.getUserId()} changed captain to user ${userId} for team ${teamId}`);
		} catch (error: unknown) {
			if (error instanceof PrismaClientKnownRequestError) {
				const [prismaError] = classifyPrismaError(error);

				switch (prismaError) {
					case PrismaError.CONSTRAINT_FAILED:
					case PrismaError.INVALID_REQUEST:
						throw new BadRequestException();
					case PrismaError.NOT_FOUND:
						throw new NotFoundException();
					default:
						this.logger.error('Uncased known prisma error: ' + error.message, error.stack);
				}
			}

			throw error;
		}
	}
}
