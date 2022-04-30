export interface IUserLoginDto {
  email: string;
  password: string;
}

export interface IUserInfoDto {
  uid: string;
  email: string;
}

export interface ICreateUserDto {
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
