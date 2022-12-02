import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/guards/roles/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles/roles.guard';
import { AuthGuard } from '../../auth/auth.guard';
import { UniversityService } from '../../universities/uni.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/universities')
export class UniversityController {
	constructor(private readonly uniService: UniversityService) {}

	@Get(':id')
	async getUniversityDetails(@Param('id', ParseIntPipe) id: number) {
		return this.uniService.getUniversityDetails(id);
	}
}
