import { Injectable } from '@nestjs/common';
import type { MatchService } from '@uni-esports/interfaces';
import type postgres from 'postgres';
import { PostgresError } from 'postgres';
import { LoggerService, logPostgresError } from '../../../common/logger-wrapper';
import { DatabaseService } from '../../../db/db.service';

type MatchTeam = {
	id: number;
	teamId: number;
	matchId: string;
	teamNumber: number;
};

@Injectable()
export class CsgoService {
	private readonly logger = new LoggerService(CsgoService.name);

	constructor(private readonly db: DatabaseService) {}

	async getVetoStartPayload(matchId: string): Promise<MatchService['match.veto._gameId.start'] | undefined> {
		this.logger.log('Fetching data to start CSGO veto', { matchId });

		let rows: postgres.RowList<MatchTeam[]>;
		try {
			rows = await this.db.query<MatchTeam[]>`
				select *
				from match_team
				where
					match_id = ${matchId}
			`;
		} catch (error: unknown) {
			if (error instanceof PostgresError) {
				logPostgresError(error, this.logger);
				return;
			}

			throw error;
		}

		if (rows.length !== 2) {
			this.logger.warn(`Error while starting CSGO veto - found ${rows?.length ?? 0} teams, expected 2`, {
				matchTeam: rows
			});
			return;
		}

		return {
			matchId,
			teamAid: rows[0].teamId,
			teamBid: rows[1].teamId
		};
	}
}
