import { Module } from '@nestjs/common';
import { UserController } from './users/users.admin.controller';
import { UserService } from './users/users.admin.service';

@Module({
	controllers: [UserController],
	providers: [UserService]
})
export class AdminModule {}
