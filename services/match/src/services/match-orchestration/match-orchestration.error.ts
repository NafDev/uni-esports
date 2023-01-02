export class MatchOrchestrationError extends Error {
	constructor(message?: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'MatchOrchestrationError';
	}
}
