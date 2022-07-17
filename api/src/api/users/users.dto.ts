import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import type {
	ICreateUserDto,
	IEmailDto,
	INewPasswordDto,
	IPasswordResetDto,
	IUserInfoDto,
	IUserLoginDto
} from '@uni-esports/interfaces';

export class UserLoginDto implements IUserLoginDto {
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email!: string;

	@IsNotEmpty() password!: string;
}

export class CreateUserDto implements ICreateUserDto {
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email!: string;

	@MinLength(6) password!: string;

	@Matches(/^[\w-.]{3,24}$/)
	username!: string;
}

export class UserInfoDto implements IUserInfoDto {
	id!: string;
	email!: string;
	username!: string;
	steam64?: string;
	discord?: string;
}

export class EmailDto implements IEmailDto {
	@IsEmail()
	@Transform((email) => email.value.toLowerCase())
	email!: string;
}

export class PasswordDto implements IPasswordResetDto {
	@MinLength(6) password!: string;
	token!: string;
}
