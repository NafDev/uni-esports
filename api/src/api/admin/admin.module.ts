import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './users/users.admin.controller';
import { UserService } from './users/users.admin.service';

@Module({
	imports: [AuthModule],
	controllers: [UserController],
	providers: [UserService]
})
export class AdminModule {}
