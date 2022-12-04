import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Session,
	UseGuards
} from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { Roles } from '../../../common/guards/roles/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles/roles.guard';
import { AuthGuard } from '../../auth/auth.guard';
import { UniversityService } from '../../universities/uni.service';
import { DomainDto, NameDto } from './uni.admin.dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/universities')
export class UniversityController {
	constructor(private readonly uniService: UniversityService) {}

	@Get(':id')
	async getUniversityDetails(@Param('id', ParseIntPipe) id: number) {
		return this.uniService.getUniversityDetails(id);
	}

	@Patch(':id/name/update')
	async updateUniversityName(
		@Param('id', ParseIntPipe) uniId: number,
		@Body() nameDto: NameDto,
		@Session() session: SessionContainer
	) {
		return this.uniService.changeUniName(nameDto.name, uniId, session);
	}

	@Post(':id/domains/add')
	async addUniversityDomain(
		@Param('id', ParseIntPipe) uniId: number,
		@Body() domainDto: DomainDto,
		@Session() session: SessionContainer
	) {
		return this.uniService.addUniDomain(domainDto.domain, uniId, session);
	}

	@Patch(':id/domains/remove')
	async removeUniversityDomain(
		@Param('id', ParseIntPipe) uniId: number,
		@Body() domainDto: DomainDto,
		@Session() session: SessionContainer
	) {
		return this.uniService.removeUniDomain(domainDto.domain, uniId, session);
	}
}
