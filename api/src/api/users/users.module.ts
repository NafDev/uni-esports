import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { UserController } from './users.controller';
import { UserService } from './users.service';

@Module({
	providers: [UserService],
	controllers: [UserController],
	exports: [UserService],
	imports: [OgmaModule.forFeatures([UserService, UserController])]
})
export class UserModule {}
