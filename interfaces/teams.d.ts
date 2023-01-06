export interface CreateTeamDto {
	teamName: string;
}

export interface InvitePlayerDto {
	invitedPlayer: string;
}

export interface TeamMemberDto {
	id: string;
	username: string;
	captain?: true;
}

export interface TeamDto {
	id: number;
	name: string;
	members: TeamMemberDto[];
	university: string;
}

export interface TeamListItemDto {
	id: number;
	name: string;
}

export interface ITeamResult {
	matchId: string;
	gameId: string;
	teamNumber: number;
	teams: { score: number | null, teamNumber: number }[];
	status: string;
	startTime: string | Date;
}