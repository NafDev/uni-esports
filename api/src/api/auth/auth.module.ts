import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { AuthConfigService } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { SupertokensService } from './supertokens/supertokens.service';

@Module({
	controllers: [AuthController],
	providers: [AuthConfigService, AuthService, SupertokensService],
	exports: [AuthService],
	imports: [OgmaModule.forFeatures([AuthController, AuthConfigService, AuthService, SupertokensService])]
})
export class AuthModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('*');
	}
}
