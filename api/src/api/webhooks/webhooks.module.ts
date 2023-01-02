import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../matches/matches.module';
import { WebhooksController } from './webhooks.controller';

@Module({
	controllers: [WebhooksController],
	imports: [AuthModule, MatchModule]
})
export class WebhooksModule {}
