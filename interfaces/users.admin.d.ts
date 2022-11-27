export interface IUsers {
	id: string;
	email: string;
	username: string;
}

export interface IUserDetails {
	id: string;
	email: string;
    username: string;
    createdAt: Date;
	verified: boolean;
	discordId: string | null;
	steam64Id: string | null;
	University: { name: string } | null;
}

export interface IUserFilters {
	email?: string;
	username?: string;
}

