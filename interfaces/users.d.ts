export interface IUserLoginDto {
	email: string;
	password: string;
}

export interface IUserInfoDto {
	id: string;
	email: string;
}

export interface ICreateUserDto {
	username: string;
	email: string;
	password: string;
}

// export interface ICreateUserResponse {
// 	email: string;
// 	username: string;
// }

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
