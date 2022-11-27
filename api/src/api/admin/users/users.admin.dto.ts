import type { IUserFilters } from '@uni-esports/interfaces';
import { IsEmail, Matches } from 'class-validator';

export class UserFiltersDto implements IUserFilters {
	email?: string;
	username?: string;
}

export class UserUpdateUsername {
	@Matches(/^[\w-.]{3,24}$/)
	username!: string;
}

export class UserUpdateEmail {
	@IsEmail()
	email!: string;
}
