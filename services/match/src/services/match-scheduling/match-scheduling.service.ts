import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import type { GameId, MatchService } from '@uni-esports/interfaces';
import { add, formatISO } from 'date-fns';
import { PostgresError } from 'postgres';
import { LoggerService, logPostgresError } from '../../common/logger-wrapper';
import { DatabaseService } from '../../db/db.service';
import { NatsService } from '../clients/nats.service';
import { MatchOrchestrationService } from '../match-orchestration/match-orchestration.service';
import type { Match } from './scheduling';

@Injectable()
export class MatchSchedulingService implements OnApplicationBootstrap {
	private readonly logger = new LoggerService(MatchSchedulingService.name);

	private readonly queuedMatches = new Map<string, Match>();

	constructor(
		private readonly db: DatabaseService,
		private readonly natsClient: NatsService,
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly matchOrchestration: MatchOrchestrationService
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	async queueUpcomingMatches() {
		this.logger.log('Starting scheduled job for upcoming matches');

		const matches = await this.pollScheduledMatches();

		if (matches) {
			this.logger.log(`Found ${matches.length} matches to be added to queue`);

			for (const match of matches) {
				const existingKey = this.queuedMatches.get(match.id);

				if (existingKey) {
					this.logger.warn(`Existing match ID key in queued matches map`, { matchId: match.id });
					continue;
				}

				this.queuedMatches.set(match.id, match);

				const callback = async () => {
					this.publishQueuedGame({ matchId: match.id, gameId: match.gameId as GameId });
					this.schedulerRegistry.deleteTimeout(`queued-match-${match.id}`);
				};

				const delay = match.startTime.getTime() - Date.now();

				const timeout = setTimeout(callback, delay);

				this.schedulerRegistry.addTimeout(`queued-match-${match.id}`, timeout);
			}
		}

		this.logger.log('Finished scheduled job for upcoming matches');
	}

	onApplicationBootstrap() {
		void this.queueUpcomingMatches();
	}

	publishQueuedGame(data: MatchService['match.start']) {
		const match = this.queuedMatches.get(data.matchId);

		if (!match) {
			this.logger.warn('Unknown ID while attempting to publish match start event - will not be sent.', {
				matchId: data.matchId
			});
			return;
		}

		void this.natsClient.emit('match.start', data);

		this.queuedMatches.delete(match.id);
	}

	processMatchStartEvent(data: MatchService['match.start']) {
		void this.matchOrchestration.startMatch(data);
	}

	async pollScheduledMatches() {
		const sql = this.db.query;

		const now = formatISO(new Date());
		const nowPlus24 = formatISO(add(new Date(), { days: 1 }));

		let rows;

		try {
			rows = await this.db.query`
				select
					${sql(['id', 'gameId', 'startTime', 'status'])}
				from match
				where
					${sql('startTime')} > ${now}
					and ${sql('startTime')} < ${nowPlus24}
					and ${sql('status')} = ${'Scheduled'}
			`;
		} catch (error: unknown) {
			if (error instanceof PostgresError) {
				logPostgresError(error, this.logger);
				return;
			}

			throw error;
		}

		if (!rows || rows.length === 0) {
			return null;
		}

		const upcomingMatches: Match[] = [];

		for (const row of rows) {
			upcomingMatches.push({
				id: row.id,
				gameId: row.gameId,
				startTime: row.startTime,
				status: row.status
			});
		}

		return upcomingMatches;
	}
}
