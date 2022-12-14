import { Transform } from 'class-transformer';
import { IsAlphanumeric, IsArray, IsDateString, IsOptional, IsPositive } from 'class-validator';

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
