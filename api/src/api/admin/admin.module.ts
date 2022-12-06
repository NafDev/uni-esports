import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TeamModule } from '../teams/teams.module';
import { UniversityModule } from '../universities/uni.module';
import { TeamController } from './teams/teams.admin.controller';
import { UniversityController } from './universities/uni.admin.controller';
import { UserController } from './users/users.admin.controller';
import { UserService } from './users/users.admin.service';

@Module({
	imports: [AuthModule, UniversityModule, TeamModule],
	controllers: [UserController, UniversityController, TeamController],
	providers: [UserService]
})
export class AdminModule {}
