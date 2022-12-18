import type { GameId, MatchService } from '@uni-esports/interfaces';
import { Transform } from 'class-transformer';
import { IsString, IsUUID } from 'class-validator';

type MatchStart = MatchService['match.start'];

export class MatchStartPayload implements MatchStart {
	@IsUUID()
	matchId!: string;

	@IsString()
	gameId!: GameId;
}
