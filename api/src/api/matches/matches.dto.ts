import { MatchStatus } from '@prisma/client';
import type { GameId, IMatchSearchQuery, VetoRequest, ICreateNewMatch } from '@uni-esports/interfaces';
import { Transform } from 'class-transformer';
import { IsAlphanumeric, IsArray, IsDate, IsIn, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateNewMatchDto implements ICreateNewMatch {
	@IsAlphanumeric()
	gameId!: string;

	@IsPositive()
	@IsOptional()
	tournamentId?: number;

	@IsPositive({ each: true })
	@IsArray()
	teamIds!: number[];

	@Transform((prop) => new Date(prop.value))
	@IsDate()
	scheduledStart!: Date;
}

export class VetoRequestBody implements VetoRequest {
	@IsPositive()
	teamId!: number;

	@IsString()
	@Transform((veto) => veto.value.toLowerCase())
	veto!: string;

	@Transform((gameId) => gameId.value.toLowerCase())
	gameId!: GameId;
}

export class MatchSearchFilters implements IMatchSearchQuery {
	@Transform((attr) => attr.value.trim())
	@IsUUID()
	@IsOptional()
	id?: string;

	@IsString()
	@IsOptional()
	gameId?: GameId;

	@Transform((attr) => new Date(attr.value))
	@IsDate()
	@IsOptional()
	startTimeLowerLimit?: Date;

	@Transform((attr) => new Date(attr.value))
	@IsDate()
	@IsOptional()
	startTimeUpperLimit?: Date;

	@IsIn(Object.values(MatchStatus))
	@IsString()
	@IsOptional()
	status?: MatchStatus;
}
