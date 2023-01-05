import { Module } from '@nestjs/common';
import { OgmaModule } from '@ogma/nestjs-module';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../matches/matches.module';
import { WebhooksController } from './webhooks.controller';

@Module({
	controllers: [WebhooksController],
	imports: [AuthModule, MatchModule, OgmaModule.forFeatures([WebhooksController])]
})
export class WebhooksModule {}
