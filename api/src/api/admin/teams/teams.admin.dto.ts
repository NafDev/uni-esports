import type { ITeamListSearch } from '@uni-esports/interfaces';
import { Allow, IsInt, IsOptional, IsString } from 'class-validator';

export class TeamListSearch implements ITeamListSearch {
	@IsString()
	@IsOptional()
	name?: string;

	@IsInt()
	@IsOptional()
	universityId?: number;
}
