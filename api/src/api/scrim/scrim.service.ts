import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import type { IOpenScrimRequest } from '@uni-esports/interfaces';
import { add, isBefore, sub } from 'date-fns';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { classifyPrismaError } from '../../db/prisma/prisma.errors';
import { PrismaService } from '../../db/prisma/prisma.service';
import { GameService } from '../games/games.service';
import type { CreateScrimDto } from './scrim.dto';

@Injectable()
export class ScrimService {
	constructor(
		@OgmaLogger(ScrimService) private readonly logger: OgmaService,
		private readonly prisma: PrismaService,
		private readonly gameService: GameService
	) {}

	async getOpenScrims(): Promise<IOpenScrimRequest[]> {
		return this.prisma.scrim.findMany({
			where: { acceptingTeamId: null, acceptDeadline: { gte: new Date() } },
			select: {
				id: true,
				matchStart: true,
				acceptDeadline: true,
				requestingTeam: { select: { id: true, name: true, university: { select: { name: true } } } }
			},
			orderBy: { acceptDeadline: 'asc' }
		});
	}

	async createNewScrim(data: CreateScrimDto, session: SessionContainer) {
		const { gameId, matchStart, teamId } = data;

		const requestingTeam = await this.prisma.team.findFirst({
			where: { id: teamId, users: { some: { userId: session.getUserId(), captain: true } } },
			select: { users: { select: { userId: true } } }
		});

		if (!requestingTeam) {
			throw new UnauthorizedException();
		}

		const canPlay = await this.checkLinkedAccounts(gameId, teamId);
		if (!canPlay) {
			throw new BadRequestException('Team must have at least 5 verified players with linked Steam accounts');
		}

		if (isBefore(matchStart, add(Date.now(), { minutes: 30 }))) {
			throw new BadRequestException('Match start time must be at least 30 minutes from now');
		}

		return this.prisma.scrim.create({
			data: {
				gameId,
				matchStart,
				acceptDeadline: sub(matchStart, { minutes: 15 }),
				requestingTeamId: teamId
			},
			select: {
				id: true,
				acceptDeadline: true,
				matchStart: true,
				requestingTeamId: true
			}
		});
	}

	async acceptScrim(scrimId: number, acceptingTeamId: number, session: SessionContainer) {
		try {
			const newMatchId = await this.prisma.$transaction(async (tx) => {
				const [acceptingTeam, scrim] = await Promise.all([
					tx.team.findFirst({
						where: { id: acceptingTeamId, users: { some: { userId: session.getUserId(), captain: true } } },
						select: { id: true }
					}),
					tx.scrim.findFirst({
						where: { id: scrimId, acceptingTeamId: null, acceptDeadline: { gte: new Date() } },
						select: { requestingTeamId: true, gameId: true, matchStart: true }
					})
				]);

				if (!acceptingTeam || !scrim) {
					throw new UnauthorizedException();
				}

				const canPlay = await this.checkLinkedAccounts(scrim.gameId, acceptingTeamId);
				if (!canPlay) {
					throw new BadRequestException('Team must have at least 5 verified players with linked Steam accounts');
				}

				await tx.scrim.update({
					where: { id: scrimId },
					data: { acceptingTeamId },
					select: { id: true }
				});

				return tx.match.create({
					data: {
						status: 'Scheduled',
						gameId: scrim.gameId,
						startTime: scrim.matchStart,
						teams: {
							createMany: {
								data: [
									{ teamId: scrim.requestingTeamId, teamNumber: 1 },
									{ teamId: acceptingTeamId, teamNumber: 2 }
								]
							}
						}
					},
					select: { id: true }
				});
			});

			return { matchId: newMatchId };
		} catch (error: unknown) {
			if (error instanceof HttpException) {
				throw error;
			}

			const [, prismaError] = classifyPrismaError(error);
			this.logger.printError(prismaError, { scrimId, acceptingTeamId });

			throw new BadRequestException(
				'Unable to accept this scrim request. It may have already been accepted by another team.'
			);
		}
	}

	private async checkLinkedAccounts(gameId: string, teamId: number) {
		if (gameId === 'csgo') {
			return this.gameService.checkCsgoTeamValidity(teamId);
		}
	}
}
