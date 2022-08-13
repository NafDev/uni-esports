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
