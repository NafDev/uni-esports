import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { AuthModule } from '../auth/auth.module';
import { GameModule } from '../games/games.module';
import { TeamModule } from '../teams/teams.module';
import { UniversityModule } from '../universities/uni.module';
import { AdminMatchModule } from './matches/matches.module';
import { AdminMatchService } from './matches/matches.service';
import { TeamController } from './teams/teams.admin.controller';
import { TeamAdminService } from './teams/teams.admin.service';
import { UniversityController } from './universities/uni.admin.controller';
import { UserController } from './users/users.admin.controller';
import { UserAdminService } from './users/users.admin.service';

@Module({
	imports: [
		AuthModule,
		UniversityModule,
		TeamModule,
		AdminMatchModule,
		GameModule,
		OgmaModule.forFeatures([
			UserController,
			UniversityController,
			TeamController,
			UserAdminService,
			TeamAdminService,
			AdminMatchService
		])
	],
	controllers: [UserController, UniversityController, TeamController],
	providers: [UserAdminService, TeamAdminService, AdminMatchService]
})
export class AdminModule {}
