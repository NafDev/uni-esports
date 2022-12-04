import type { IUniversityDomainDto, IUniversityNameDto } from '@uni-esports/interfaces';
import { IsNotEmpty } from 'class-validator';

export class DomainDto implements IUniversityDomainDto {
	@IsNotEmpty()
	domain!: string;
}

export class NameDto implements IUniversityNameDto {
	@IsNotEmpty()
	name!: string;
}
