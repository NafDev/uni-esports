import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthConfigService } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from './auth.middleware';
import { AuthService } from './auth.service';
import { SupertokensService } from './supertokens/supertokens.service';

@Module({
	controllers: [AuthController],
	providers: [AuthConfigService, AuthService, SupertokensService],
	exports: [AuthService]
})
export class AuthModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('*');
	}
}
