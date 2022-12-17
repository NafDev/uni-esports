import process from 'node:process';
import { cleanEnv, str, url } from 'envalid';

const appConfig = cleanEnv(process.env, {
	NODE_ENV: str({ devDefault: 'development', choices: ['development', 'production', 'test'] }),

	DATABASE_URI: url({ example: 'postgresql://postgres:password@localhost:5432/postgres?schema=public' }),

	NATS_SERVER_URL: url({ devDefault: 'nats://localhost:4222' }),

	ST_CORE_URL: url({
		devDefault: 'http://127.0.0.1:3567/',
		desc: 'The API domain for the SuperTokens Core service'
	})
});

export default appConfig;
