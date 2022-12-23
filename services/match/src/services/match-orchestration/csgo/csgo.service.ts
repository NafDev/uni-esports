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

	async getVetoStartPayload(matchId: string) {
		this.logger.log('Fetching data to start CSGO veto', { matchId });

		const data = await this.getTeamIds(matchId);

		return data;
	}

	async startMatch(matchId: string, vetoResult: string) {
		this.logger.log('Starting CSGO match with completed veto', { matchId, vetoResult });

		try {
			await this.db.query.begin(async (sql) => {
				const rows = await sql`
					update
						${sql('match')}
					set
						${sql({ status: 'Ongoing' })}
					where
						${sql('id')} = ${matchId}
				`;

				if (rows.length !== 1) {
					throw new PostgresError('Transaction failed - zero rows updated');
				}

				await sql`
					insert into
						${sql('matchDetailsCsgo')}
						${sql({ matchId, map: vetoResult })}
				`;
			});
		} catch (error: unknown) {
			if (error instanceof PostgresError) {
				logPostgresError(error, this.logger);
			}

			throw error;
		}

		// Get team IDs
		// Get player Steam IDs from team IDs
		// Convert to Steam32
		// Add to steam_x_id under match_details_csgo
		// Move onto DatHost
	}

	private async getTeamIds(matchId: string): Promise<MatchService['match.veto._gameId.start'] | undefined> {
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
			this.logger.warn(`Error while fetching team details - found ${rows?.length ?? 0} teams, expected 2`, {
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
