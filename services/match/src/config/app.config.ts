import process from 'node:process';
import { cleanEnv, EnvError, makeValidator, str, url } from 'envalid';
import ms, { type StringValue } from 'ms';

const msString = makeValidator<number>((input) => {
	const msResult = ms(input as StringValue);

	if (Number.isNaN(msResult)) {
		throw new EnvError('Parsed value is not a number');
	}

	return msResult;
});

const stringArray = makeValidator<string[]>((input) => {
	const values = input.split(',');

	if (!values || values.length === 0) {
		throw new EnvError('Expected of comma-separated list non-zero length');
	}

	return values;
});

const appConfig = cleanEnv(process.env, {
	NODE_ENV: str({ devDefault: 'development', choices: ['development', 'production', 'test'] }),

	DATABASE_URI: url({ example: 'postgresql://postgres:password@localhost:5432/postgres?schema=public' }),

	NATS_SERVER_URL: url({ devDefault: 'nats://localhost:4222' }),

	ST_CORE_URL: url({
		devDefault: 'http://127.0.0.1:3567/',
		desc: 'The API domain for the SuperTokens Core service'
	}),

	VETO_RESULT_TTL: msString({
		default: 30_000,
		desc: 'Length of time before veto history is deleted after a result has been reached (vercel/ms time format)'
	}),

	VETO_HAND_TIMEOUT: msString({
		default: 30_000,
		desc: 'Length of time to wait for a veto request before randomised pick (vercel/ms time format)'
	}),

	VETO_CSGO_POOL: stringArray({
		desc: 'Comma-separated list of veto choices representing CSGO active duty map pool'
	})
});

export default appConfig;
