import process from 'node:process';
import { cleanEnv, EnvError, makeValidator, num, str, url } from 'envalid';
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
	NATS_TOKEN: str({ devDefault: '' }),

	ST_CORE_URL: url({
		devDefault: 'http://127.0.0.1:3567/',
		desc: 'The API domain for the SuperTokens Core service'
	}),

	API_DOMAIN: url({
		desc: 'Domain part of the JWKS URL that will be used to verify the JWT'
	}),

	STEAM_WEB_API_KEY: str({
		desc: 'API key to communicate with Steam Web API',
		docs: 'https://partner.steamgames.com/doc/webapi_overview/auth'
	}),

	VETO_RESULT_TTL: msString({
		default: 30_000,
		desc: 'Length of time before veto history is deleted after a result has been reached (vercel/ms time format)'
	}),

	VETO_HAND_TIMEOUT: msString({
		default: 30_000,
		desc: 'Length of time to wait for a veto request before randomised pick (vercel/ms time format)'
	}),

	CSGO_PLAYER_CONNECT_TIMEOUT: num({
		desc: 'Number of seconds CSGO server will wait for players before cancelling match'
	}),

	CSGO_VETO_POOL: stringArray({
		desc: 'Comma-separated list of veto choices representing CSGO active duty map pool'
	}),

	CSGO_DATHOST_BASE: str({
		desc: 'ID of DatHost server to use as cloning template'
	}),

	CSGO_DATHOST_USERNAME: str({
		desc: 'Email address of DatHost account to use (as username credential) for API requests'
	}),

	CSGO_DATHOST_PASSWORD: str({
		desc: 'Password of DatHost account to use for API requests'
	})
});

export default appConfig;

export const CSGO_APP_ID = 730;
