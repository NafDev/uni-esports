import type { IUserFilters } from '@uni-esports/interfaces';
import { Allow, IsEmail, Matches } from 'class-validator';

export class UserFiltersDto implements IUserFilters {
	@Allow()
	email?: string;

	@Allow()
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
