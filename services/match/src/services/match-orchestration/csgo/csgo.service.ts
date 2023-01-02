import { Injectable } from '@nestjs/common';
import type { MatchService } from '@uni-esports/interfaces';
import type postgres from 'postgres';
import { PostgresError } from 'postgres';
import Steam from 'steamid';
import { LoggerService, logPostgresError } from '../../../common/logger-wrapper';
import { DatabaseService } from '../../../db/db.service';
import { MatchOrchestrationError } from '../match-orchestration.error';
import { CsgoServerService } from './csgo-server.service';
import type { MatchEndInfo, MatchServerStart } from './dathost-api';

export type Match = {
	id: string;
	map: string;
};
export type Team = {
	name: string;
	steam32Ids: string[];
};
@Injectable()
export class CsgoService {
	private readonly logger = new LoggerService(CsgoService.name);

	constructor(private readonly db: DatabaseService, private readonly csgoServerService: CsgoServerService) {}

	async getVetoStartPayload(matchId: string) {
		this.logger.log('Fetching data to start CSGO veto', { matchId });

		const data = await this.getTeamIds(matchId);

		return data;
	}

	async startMatch(matchId: string, vetoResult: string) {
		this.logger.log('Starting CSGO match with completed veto', { matchId, vetoResult });

		await this.db.query.begin(async (sql) => {
			const rows = await sql`
				update
					${sql('match')}
				set
					${sql({ status: 'Ongoing' })}
				where
					${sql('id')} = ${matchId}
				returning
					${sql('id')}
			`;

			if (rows.length !== 1) {
				throw new MatchOrchestrationError('Match ID not found when setting match status');
			}

			await sql`
				insert into
					${sql('matchDetailsCsgo')}
					${sql({ matchId, map: vetoResult })}
			`;
		});

		type Player = {
			userId: string;
			teamId: number;
			teamNumber: number;
			steam64Id: string;
			teamName: string;
		};

		const sql = this.db.query;
		const players = await this.db.query<Player[]>`
				select 
					tu.user_id as ${sql('userId')},
					mt.team_id as ${sql('teamId')},
					mt.team_number as ${sql('teamNumber')},
					u.steam_64_id as ${sql('steam64Id')},
					t.name as ${sql('teamName')}
				from 
					"match" as m 
				inner join
					"match_team" as mt
					on m.id = mt.match_id 
					and m.id = ${matchId}
					inner join
						"team_user" as tu 
						on tu.team_id = mt.team_id
						inner join 
							"user" as u
							on u.id = tu.user_id 
							and u.steam_64_id is not null
							inner join
								"team" as t
								on mt.team_id = t.id
			`;

		if (!players || players.length === 0) {
			throw new MatchOrchestrationError('Empty players list');
		}

		const team1Players: Player[] = players.filter((player) => player.teamNumber === 1);
		const team2Players: Player[] = players.filter((player) => player.teamNumber === 2);

		const team1steam32ids: string[] = [];
		for (const player of team1Players) {
			const steamId = new Steam(player.steam64Id);
			if (steamId.isValidIndividual()) {
				team1steam32ids.push(steamId.getSteam2RenderedID(true));
			}
		}

		const team2steam32ids: string[] = [];
		for (const player of team2Players) {
			const steamId = new Steam(player.steam64Id);
			if (steamId.isValidIndividual()) {
				team2steam32ids.push(steamId.getSteam2RenderedID(true));
			}
		}

		await this.db.query`
			update
				${sql('matchDetailsCsgo')}
			set
				${sql({ team_1_steam_ids: team1steam32ids })},
				${sql({ team_2_steam_ids: team2steam32ids })}
			where
				${sql('matchId')} = ${matchId}
		`;

		const team1: Team = {
			name: team1Players.at(0)?.teamName ?? 'Team 1',
			steam32Ids: team1steam32ids
		};

		const team2: Team = {
			name: team2Players.at(0)?.teamName ?? 'Team 2',
			steam32Ids: team2steam32ids
		};

		const { connectString, serverId, gameAccountDetails } = await this.csgoServerService.startMatch(
			{ id: matchId, map: vetoResult },
			team1,
			team2
		);

		await this.db.query`
			update
				${sql('matchDetailsCsgo')}
			set
				${sql({
					serverConnect: connectString,
					serverId,
					steamGameServerToken: gameAccountDetails.login_token,
					steamGameServerId: gameAccountDetails.steamid
				})}
			where
				${sql('matchId')} = ${matchId}
		`;

		return { matchId, connectString };
	}

	async endMatch(matchId: string, matchData: MatchServerStart) {
		type ServerDetails = {
			steamGameServerId: string;
			steamGameServerToken: string;
			serverId: string;
		};

		const { team1_stats, team2_stats, cancel_reason } = matchData;
		const matchCancelled = cancel_reason?.length > 0;

		const [serverDetails] = await this.db.query.begin(async (sql) => {
			await this.db.query`
				update
					${sql('matchDetailsCsgo')}
				set
					${sql({
						team_1_score: team1_stats.score,
						team_2_score: team2_stats.score
					})}
				where
					${sql('matchId')} = ${matchId}
			`;

			await this.db.query`
				update
					${sql('match')}
				set
					${sql('status')} = ${matchCancelled ? 'Cancelled' : 'Completed'}
				where
					${sql('id')} = ${matchId}
			`;

			const serverDetails = await this.db.query<ServerDetails[]>`
				select
					${sql(['steamGameServerId', 'steamGameServerToken', 'serverId'])}
				from 
					${sql('matchDetailsCsgo')}
				where
					${sql('matchId')} = ${matchId}
			`;

			return serverDetails;
		});

		await this.csgoServerService.stopMatch(serverDetails.serverId, serverDetails.steamGameServerId);

		const sql = this.db.query;

		await this.db.query`
			update
				${sql('matchDetailsCsgo')}
			set
				${sql({
					steam_game_server_id: null,
					steam_game_server_token: null,
					server_id: null
				})}
			where
				${sql('matchId')} = ${matchId}
		`;
	}

	async updateScores(matchId: string, team1Score: number, team2Score: number) {
		const sql = this.db.query;

		await this.db.query`
			update
				${sql('matchDetailsCsgo')}
			set
				${sql({
					team_1_score: team1Score,
					team_2_score: team2Score
				})}
			where
				${sql('matchId')} = ${matchId}
		`;
	}

	private async getTeamIds(matchId: string): Promise<MatchService['match.veto._gameId.start'] | undefined> {
		type MatchTeam = {
			id: number;
			teamId: number;
			matchId: string;
			teamNumber: number;
		};

		const rows = await this.db.query<MatchTeam[]>`
				select *
				from match_team
				where
					match_id = ${matchId}
			`;

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
