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
			pool: string[];
			vetoed: string[];
		};
	};
	'match.veto._gameId.start': {
		matchId: string;
		teamAid: string;
		teamBid: string;
	};
	'match.veto._gameId.request': {
		matchId: string;
		teamId: string;
		veto: string;
	};
	'match.veto._gameId.update': {
		matchId: string;
		vetoed: string;
		time: string;
	};
}
