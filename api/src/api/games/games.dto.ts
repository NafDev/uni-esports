import { LinkedIdentities } from '@prisma/client';
import { IsAlphanumeric, IsArray, IsBoolean, IsIn, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateNewGameDto {
	@IsAlphanumeric()
	id!: string;

	@IsString()
	displayName!: string;

	@IsPositive()
	playersPerTeam!: number;

	@IsPositive()
	teamsPerMatch!: number;

	@IsBoolean()
	hasVeto!: boolean;

	@IsArray()
	@IsIn(Object.values(LinkedIdentities), { each: true })
	@IsOptional()
	requiredIds?: LinkedIdentities[];
}
