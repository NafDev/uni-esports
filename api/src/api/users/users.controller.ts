import { Body, Controller, Get, Post, Session, UseGuards } from '@nestjs/common';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './users.dto';
import { UserService } from './users.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('me')
	@UseGuards(AuthGuard)
	async getUser(@Session() session: SessionContainer) {
		return this.userService.getUserInfo(session);
	}

	@Post('create')
	async createUser(@Body() createUserDto: CreateUserDto) {
		return this.userService.createUser(createUserDto);
	}
}
