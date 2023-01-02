import type { GameId } from '../games';

export interface MatchService {
	'match.start': {
		matchId: string;
		gameId: GameId;
	};
	'match.veto.status': {
		req: {
			matchId: string;
		};
		res: {
			vetoed: string[];
			teamId: number;
			time: string;
			status: 'Ongoing'
		} | { status: 0 };
	};
	'match.veto._gameId.start': {
		matchId: string;
		teamAid: number;
		teamBid: number;
	};
	'match.veto._gameId.request': {
		matchId: string;
		teamId: number;
		veto: string;
	};
	'match.veto.start': {
		matchId: string;
	};
	'match.veto.update': {
		matchId: string;
		vetoed: string;
		teamId: number;
		time: string;
	};
	'match.veto.result': {
		matchId: string;
		result: string;
		gameId: GameId;
	},
	'match.server.start': {
		matchId: string;
		connectString: string;
	},
	'match.event.csgo.round': {
		matchId: string
		roundData: Record<string, any>
	},
	'match.event.csgo.match': {
		matchId: string
		matchData: Record<string, any>
	},
	'match_round': { // SSE Data
		team1Score: number,
		team2Score: number
	},
	'match_end': { // SSE Data
		team1Score: number,
		team2Score: number
	}
}
