// https://partner.steamgames.com/doc/webapi/IGameServersService

export type GetAccountListResponse = {
	response: {
		servers: Array<{
			steamid: string;
			appid: number;
			login_token: string;
			memo: string;
			is_deleted: boolean;
			is_expired: boolean;
			rt_last_logon: number;
		}>;
		is_banned: boolean;
		expires: number;
		actor: string;
		last_action_time: number;
	};
};

export type CreateAccountResponse = {
	response: {
		steamid: string;
		login_token: string;
	};
};

export type QueryLoginTokenResponse = {
	response: {
		is_banned: boolean;
		expires: number;
		steamid: string;
	};
};
