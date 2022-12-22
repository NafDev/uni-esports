import type { GameId, VetoRequest } from '@uni-esports/interfaces';
import { Transform } from 'class-transformer';
import { IsAlphanumeric, IsArray, IsDateString, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateNewMatchDto {
	@IsAlphanumeric()
	gameId!: string;

	@IsPositive()
	@IsOptional()
	tournamentId?: number;

	@IsPositive({ each: true })
	@IsArray()
	teams!: number[];

	@Transform((prop) => new Date(prop as unknown as string))
	@IsDateString()
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
