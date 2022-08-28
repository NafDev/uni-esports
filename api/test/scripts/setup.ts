import process from 'node:process';
import supertest from 'supertest';

export default async function setup() {
	await pollApi().catch(() => {
		console.error('Test setup failed - API did not respond after 5 seconds');
		process.exit(1); // eslint-disable-line unicorn/no-process-exit
	});
}

const pollApi = async () =>
	new Promise<void>((resolve, reject) => {
		const timeout = 5 * 1000;
		const start = Date.now();

		const app = supertest('http://localhost:3000');

		const timerId = setInterval(async () => {
			try {
				await app.get('/ping');
				clearInterval(timerId);

				resolve();
			} catch (error: unknown) {
				if (!(error instanceof Error && error.message.includes('ECONNREFUSED')) || Date.now() - start > timeout) {
					clearInterval(timerId);

					reject(error);
				}
			}
		}, 500);
	});
