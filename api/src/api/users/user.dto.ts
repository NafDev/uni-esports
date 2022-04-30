import { ICreateUserDto, IEmailDto, INewPasswordDto, IUserLoginDto } from '@uniesports/types';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class UserLoginDto implements IUserLoginDto {
  @IsEmail()
  @Transform((email) => email.value.toLowerCase())
  email: string;

  @IsNotEmpty() password: string;
}

export class CreateUserDto implements ICreateUserDto {
  @IsEmail()
  @Transform((email) => email.value.toLowerCase())
  email: string;

  @MinLength(6) password: string;
}

export class EmailDto implements IEmailDto {
  @IsEmail()
  @Transform((email) => email.value.toLowerCase())
  email: string;
}

export class NewPasswordDto implements INewPasswordDto {
  @MinLength(6) password: string;
  oldPassword: string;
}
