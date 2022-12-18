import type { GameId } from "../games";

export interface MatchService {
	"match.start": {
		matchId: string;
		gameId: GameId
	}
}