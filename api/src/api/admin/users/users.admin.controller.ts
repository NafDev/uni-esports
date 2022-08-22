import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../../common/guards/roles/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles/roles.guard';
import { UserFiltersDto } from './users.admin.dto';
import { UserService } from './users.admin.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('list')
	async allUsersList(@Query('page', ParseIntPipe) page: number, @Body() findQuery: UserFiltersDto) {
		return this.userService.findAllUsers(page, findQuery);
	}

	@Get(':userId')
	async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
		return this.userService.findUser(userId);
	}

	@Patch('steam/remove/:userId')
	async unlinkSteamId(@Param('userId', ParseUUIDPipe) userId: string) {
		return this.userService.unlinkSteamId(userId);
	}
}
