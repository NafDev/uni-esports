import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TeamModule } from '../teams/teams.module';
import { UniversityModule } from '../universities/uni.module';
import { GameModule } from '../games/games.module';
import { TeamController } from './teams/teams.admin.controller';
import { TeamAdminService } from './teams/teams.admin.service';
import { UniversityController } from './universities/uni.admin.controller';
import { UserController } from './users/users.admin.controller';
import { UserAdminService } from './users/users.admin.service';
import { AdminMatchService } from './matches/matches.service';
import { AdminMatchModule } from './matches/matches.module';

@Module({
	imports: [AuthModule, UniversityModule, TeamModule, AdminMatchModule, GameModule],
	controllers: [UserController, UniversityController, TeamController],
	providers: [UserAdminService, TeamAdminService, AdminMatchService]
})
export class AdminModule {}
