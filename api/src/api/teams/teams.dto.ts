import type { CreateTeamDto as NewTeamDto, InvitePlayerDto as InviteNewPlayerDto } from '@uni-esports/interfaces';
import { IsNotEmpty, Matches } from 'class-validator';

export class CreateTeamDto implements NewTeamDto {
	@Matches(/^[\w-. ]{3,24}$/)
	teamName!: string;
}

export class InvitePlayerDto implements InviteNewPlayerDto {
	@IsNotEmpty()
	invitedPlayer!: string;
}
