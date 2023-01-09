export type GameId = "csgo" | "csgo2v2" | "valorant" | "league";

export interface GameListItem {
	id: string;
	displayName: string;
}

export interface IGameMatchResult {
	id: string;
	startTime: Date;
	status: 'Ongoing' | 'Completed';
	teams: {
			score: number | null;
			name: string;
	}[];
}