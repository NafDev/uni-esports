import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UniversityModule } from '../universities/uni.module';
import { UniversityController } from './universities/uni.admin.controller';
import { UserController } from './users/users.admin.controller';
import { UserService } from './users/users.admin.service';

@Module({
	imports: [AuthModule, UniversityModule],
	controllers: [UserController, UniversityController],
	providers: [UserService]
})
export class AdminModule {}
