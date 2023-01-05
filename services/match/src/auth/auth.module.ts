import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { AuthService } from './auth.service';

@Module({
	imports: [OgmaModule.forFeatures([AuthService])],
	providers: [AuthService],
	exports: [AuthService]
})
export class AuthModule {}
