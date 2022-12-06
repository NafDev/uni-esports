import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Session,
	UseGuards
} from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../../common/guards/roles/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles/roles.guard';
import { ParsePositiveIntPipe } from '../../../common/pipes/positive-int.pipe';
import { UserFiltersDto, UserUpdateEmail, UserUpdateUsername } from './users.admin.dto';
import { UserService } from './users.admin.service';

@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post('list')
	@HttpCode(200)
	async allUsersList(@Query('page', ParsePositiveIntPipe) page: number, @Body() findQuery: UserFiltersDto) {
		return this.userService.findAllUsers(page, findQuery);
	}

	@Get(':userId')
	async getUser(@Param('userId', ParseUUIDPipe) userId: string) {
		return this.userService.findUser(userId);
	}

	@Patch(':userId/steam/remove')
	async unlinkSteamId(@Param('userId', ParseUUIDPipe) userId: string, @Session() session: SessionContainer) {
		return this.userService.unlinkSteamId(userId, session);
	}

	@Patch(':userId/username/update')
	async updateUsername(
		@Param('userId', ParseUUIDPipe) userId: string,
		@Body() body: UserUpdateUsername,
		@Session() session: SessionContainer
	) {
		return this.userService.updateUsername(userId, body.username, session);
	}

	@Patch(':userId/email/update')
	async updateEmail(
		@Param('userId', ParseUUIDPipe) userId: string,
		@Body() body: UserUpdateEmail,
		@Session() session: SessionContainer
	) {
		return this.userService.updateEmail(userId, body.email, session);
	}

	@Get(':userId/password/reset/email')
	async sendPasswordResetEmail(@Param('userId', ParseUUIDPipe) userId: string, @Session() session: SessionContainer) {
		return this.userService.sendPasswordReset(userId, session);
	}
}
