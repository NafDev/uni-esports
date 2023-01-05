import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OgmaModule } from '@ogma/nestjs-module';
import appConfig from '../../config/app.config';
import { MatchController } from './matches.controller';
import { MatchService } from './matches.service';

@Module({
	controllers: [MatchController],
	providers: [MatchService],
	exports: [MatchService],
	imports: [
		OgmaModule.forFeatures([MatchController, MatchService]),
		ClientsModule.register([
			{ name: 'NATS', transport: Transport.NATS, options: { servers: appConfig.NATS_SERVER_URL } }
		])
	]
})
export class MatchModule {}
