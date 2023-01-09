import type { IAcceptScrimDto, ICreateNewScrim } from '@uni-esports/interfaces';
import { Transform } from 'class-transformer';
import { IsString, IsDate, IsPositive } from 'class-validator';

export class CreateScrimDto implements ICreateNewScrim {
	@Transform((gameId) => gameId.value.toLowerCase())
	@IsString()
	gameId!: string;

	@Transform((prop) => new Date(prop.value))
	@IsDate()
	matchStart!: Date;

	@IsPositive()
	teamId!: number;
}

export class AcceptScrimDto implements IAcceptScrimDto {
	@IsPositive()
	scrimId!: number;

	@IsPositive()
	teamId!: number;
}
