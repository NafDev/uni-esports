import { GameId } from "./games";

export interface VetoRequest {
	teamId: number;
	veto: string;
	gameId: GameId;
}