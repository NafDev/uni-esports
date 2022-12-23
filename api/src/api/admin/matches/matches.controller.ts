import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../../common/guards/roles/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles/roles.guard';
import { ParsePositiveIntPipe } from '../../../common/pipes/positive-int.pipe';
import { AuthGuard } from '../../auth/auth.guard';
import { CreateNewMatchDto, MatchSearchFilters } from '../../matches/matches.dto';
import { AdminMatchService } from './matches.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/matches')
export class AdminMatchController {
	constructor(private readonly adminMatchService: AdminMatchService) {}

	@Post('list')
	async getMatchList(@Query('page', ParsePositiveIntPipe) page: number, @Body() filters: MatchSearchFilters) {
		return this.adminMatchService.getMatches(filters, page);
	}

	@Post('create')
	async createMatch(@Body() dto: CreateNewMatchDto) {
		return this.adminMatchService.scheduleNewMatch(dto);
	}
}
