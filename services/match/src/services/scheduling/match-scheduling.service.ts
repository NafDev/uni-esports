import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { add, formatISO } from 'date-fns';
import { PostgresError } from 'postgres';
import type { GameId } from '@uni-esports/interfaces';
import { DatabaseService } from '../../db/db.service';
import type { Match } from './scheduling';
import { MatchSchedulingPublisher } from './match-scheduling.publisher';

@Injectable()
export class MatchSchedulingService {
	private readonly logger = new Logger(MatchSchedulingService.name);

	constructor(
		private readonly db: DatabaseService,
		private readonly schedulerRegistry: SchedulerRegistry,
		private readonly schedulingPublisher: MatchSchedulingPublisher
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	async queueUpcomingMatches() {
		this.logger.log('Starting scheduled job for upcoming matches');

		const matches = await this.pollScheduledMatches();

		if (matches) {
			this.logger.log(`Found ${matches.length} matches to be added to queue`);

			for (const match of matches) {
				const existingKey = this.schedulingPublisher.queuedMatches.get(match.id);

				if (existingKey) {
					this.logger.warn({ msg: `Existing match ID key in queued matches map`, matchId: match.id });
					continue;
				}

				this.schedulingPublisher.queuedMatches.set(match.id, match);

				const callback = async () => {
					this.schedulingPublisher.publishQueuedGame({ matchId: match.id, gameId: match.gameId as GameId });
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

	async pollScheduledMatches() {
		const now = formatISO(new Date());
		const nowPlus24 = formatISO(add(new Date(), { days: 1 }));

		let rows;

		try {
			rows = await this.db.query`
				select
					*
				from match
				where
					"startTime" > ${now}
					and "startTime" < ${nowPlus24}
					and "status" != ${'Ongoing'}
			`;

			if (rows.length === 0) {
				return null;
			}
		} catch (error: unknown) {
			if (error instanceof PostgresError) {
				this.logger.error(error.message, error.stack);
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
