import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../clients/nats.service';
import type { Match } from './scheduling';

@Injectable()
export class SchedulingPublisher {
	readonly queuedMatches = new Map<string, Match>();

	private readonly logger = new Logger(SchedulingPublisher.name);

	constructor(private readonly natsClient: NatsService) {}

	publishQueuedGame(matchId: string, gameId: string) {
		const match = this.queuedMatches.get(matchId);

		if (!match) {
			this.logger.warn({ matchId }, 'Unknown ID while attempting to publish "match.start". Event will not be sent.');
			return;
		}

		void this.natsClient.emit('match.start', { matchId, gameId });

		this.queuedMatches.delete(match.id);
	}
}
