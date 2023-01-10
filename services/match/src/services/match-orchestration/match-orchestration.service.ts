import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import type { MatchService } from '@uni-esports/interfaces';
import { PostgresError } from 'postgres';
import { DatabaseService } from '../../db/db.service';
import { NatsClientInjectionToken } from '../clients/nats.module';
import { CsgoService } from './csgo/csgo.service';
import { MatchOrchestrationError } from './match-orchestration.error';

@Injectable()
export class MatchOrchestrationService {
	constructor(
		@OgmaLogger(MatchOrchestrationService) private readonly logger: OgmaService,
		@Inject(NatsClientInjectionToken) readonly natsClient: ClientProxy,
		private readonly db: DatabaseService,
		private readonly csgoService: CsgoService
	) {}

	async setupMatch(data: MatchService['match.start']) {
		this.logger.info('Processing match start event', { ...data });

		const { matchId, gameId } = data;

		if (!matchId || !gameId) {
			this.logger.error('Error while starting match - one or more required attributes is undefined', { ...data });
			return;
		}

		const sql = this.db.query;
		const [match] = await this.db.query<Array<{ id: string }>>`
			update
				${sql('match')}
			set
				${sql({ status: 'Setup' })}
			where
				${sql('id')} = ${matchId} and
				${sql('status')} = 'Scheduled'
			returning
				${sql('id')}
		`;

		if (!match) {
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

	async startMatchWithVetoResult(data: MatchService['match.veto.result']) {
		const { matchId, result, gameId } = data;

		if (!matchId || !result || !gameId) {
			this.logger.error('Error while starting match orchestration - one or more parameters are undefined', { ...data });
			return;
		}

		try {
			switch (gameId) {
				case 'csgo': {
					const matchInfo: MatchService['match.server.start'] = await this.csgoService.startMatch(
						data.matchId,
						data.result
					);

					// Some time for the CSGO server to load up...
					setTimeout(() => {
						this.natsClient.emit('match.server.start', matchInfo);
					}, 10_000);
					break;
				}

				default: {
					this.logger.error('Unknown game ID', { ...data });
					break;
				}
			}
		} catch (error: unknown) {
			if (error instanceof MatchOrchestrationError) {
				this.logger.error(error.message, error.stack, { matchId });
			}

			if (error instanceof PostgresError) {
				this.logger.printError(error);
			}

			await this.cancelMatch(matchId);
		}
	}

	private async cancelMatch(matchId: string) {
		this.logger.info('Cancelling match due to caught error', { matchId });

		const sql = this.db.query;
		try {
			await this.db.query`
				update
					${sql('match')}
				set
					${sql('status')} = 'Cancelled'
				where
					${sql('id')} = ${matchId}
			`;
		} catch (error: unknown) {
			if (error instanceof PostgresError) {
				this.logger.printError(error);
				this.logger.warn('Failed to set match status to cancelled', { matchId });

				return;
			}

			throw error;
		}
	}
}
