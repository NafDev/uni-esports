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
		score: number | null;
		teamNumber: number;
	}[];
}

export type IMatchDetailsCsgo = IMatchInfo & {
	map: string | null;
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

export interface ICreateNewScrim {
	gameId: string;
	matchStart: Date | string;
	teamId: number;
}

export interface IAcceptScrimDto {
	scrimId: number;
	teamId: number;
}

export interface IOpenScrimRequest {
	id: number;
    matchStart: Date | string;
    acceptDeadline: Date | string;
    requestingTeam: {
        id: number;
        name: string;
        university: {
            name: string;
        };
    };
}