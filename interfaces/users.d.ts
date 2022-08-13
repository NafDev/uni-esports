export interface IUserLoginDto {
	email: string;
	password: string;
}

export interface IUserInfoDto {
	id: string;
	email: string;
	username: string;
	university?: string;
	steam64?: string;
	discord?: string;
}

export interface ICreateUserDto {
	username: string;
	email: string;
	password: string;
}

export interface IEmailDto {
	email: string;
}

export interface IPasswordResetDto {
	token: string;
	password: string;
}

export interface INewPasswordDto {
	oldPassword: string;
	password: string;
}
