import { GameId } from './games';

export interface VetoRequest {
	teamId: number;
	veto: string;
	gameId: GameId;
}

export interface IMatchListItem {
	id: string;
	gameId: string;
	startTime: Date;
	status: string;
}

export interface IMatchSearchQuery {
	id?: string;
	gameId?: string;
	status?: string;
	startTimeLowerLimit?: Date;
	startTimeUpperLimit?: Date;
}

export interface IMatchInfo {
	id: string;
	gameId: string;
	status: string;
	startTime: Date;
	teams: {
		id: number;
		name: string;
		teamNumber: number;
	}[];
}

export type IMatchDetailsCsgo = IMatchInfo & {
	map: string | null;
	team1Score: number;
	team2Score: number;
	connectString: string | null;
};

export interface ICreateNewMatch {
	gameId: string;
	tournamentId?: number;
	teamIds: number[];
	scheduledStart: Date;
}

export interface IUpcomingMatch {
	matchId: string;
	gameId: GameId;
	tournamentId: string | null;
	time: string | Date;
	universityIds: number[];
}
