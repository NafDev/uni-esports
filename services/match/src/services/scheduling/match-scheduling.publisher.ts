import { Injectable, Logger } from '@nestjs/common';
import type { MatchService } from '@uni-esports/interfaces';
import { NatsService } from '../clients/nats.service';
import type { Match } from './scheduling';

@Injectable()
export class MatchSchedulingPublisher {
	readonly queuedMatches = new Map<string, Match>();

	private readonly logger = new Logger(MatchSchedulingPublisher.name);

	constructor(private readonly natsClient: NatsService) {}

	publishQueuedGame(data: MatchService['match.start']) {
		const match = this.queuedMatches.get(data.matchId);

		if (!match) {
			this.logger.warn(
				{ matchId: data.matchId },
				'Unknown ID while attempting to publish "match.start". Event will not be sent.'
			);
			return;
		}

		void this.natsClient.emit('match.start', data);

		this.queuedMatches.delete(match.id);
	}
}
