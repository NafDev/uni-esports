import { Injectable } from '@nestjs/common';
import type { MatchService } from '@uni-esports/interfaces';
import type postgres from 'postgres';
import { PostgresError } from 'postgres';
import { LoggerService, logPostgresError } from '../../common/logger-wrapper';
import { DatabaseService } from '../../db/db.service';
import { NatsService } from '../clients/nats.service';
import { CsgoService } from './csgo/csgo.service';

@Injectable()
export class MatchOrchestrationService {
	private readonly logger = new LoggerService(MatchOrchestrationService.name);

	constructor(
		private readonly db: DatabaseService,
		private readonly natsClient: NatsService,
		private readonly csgoService: CsgoService
	) {}

	async startMatch(data: MatchService['match.start']) {
		this.logger.log('Processing match start event', { ...data });

		const { matchId, gameId } = data;

		if (!matchId || !gameId) {
			this.logger.error('Error while starting match - one or more required attributes is undefined', { ...data });
		}

		const sql = this.db.query;
		let rows: postgres.Row[];

		try {
			rows = await this.db.query`
				update
					${sql('match')}
				set
					${sql({ status: 'Setup' })}
				where
					${sql('id')} = ${matchId}
				returning
					${sql('id')}
			`;
		} catch (error: unknown) {
			if (error instanceof PostgresError) {
				logPostgresError(error, this.logger);
				return;
			}

			throw error;
		}

		if (!rows || rows.length === 0) {
			this.logger.warn('Match ID was not found when updating match status', { matchId });
			return;
		}

		switch (gameId) {
			case 'csgo': {
				const data = await this.csgoService.getVetoStartPayload(matchId);
				if (data) {
					this.natsClient.emit('match.veto.csgo.start', data);
				}

				break;
			}

			default: {
				this.logger.warn('Unknown game ID while starting match', { ...data });
				break;
			}
		}
	}

	async startMatchServerFromVetoResult(data: MatchService['match.veto.result']) {
		const { matchId, result, gameId } = data;

		if (!matchId || !result || !gameId) {
			this.logger.error('Error while starting match orchestration - one or more parameters are undefined', { ...data });
			return;
		}

		switch (gameId) {
			case 'csgo': {
				void this.csgoService.startMatch(data.matchId, data.result);
				break;
			}

			default: {
				this.logger.error('Unknown game ID', { ...data });
				break;
			}
		}
	}
}
