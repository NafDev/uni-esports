import process from 'node:process';
import { cleanEnv, num, port, str, url } from 'envalid';

const appConfig = cleanEnv(process.env, {
	NODE_ENV: str({ devDefault: 'development', choices: ['development', 'production', 'test'] }),
	PORT: port({ default: 3000 }),
	PASSWORD_SALT_ROUNDS: num({ default: 12 }),
	PASSWORD_RESET_EXPIRY_MINS: num({ default: 15 }),

	DATABASE_URI: url({ example: 'postgresql://postgres:password@localhost:5432/postgres?schema=public' }),

	ST_CORE_URL: url({
		devDefault: 'http://127.0.0.1:3567/',
		desc: 'The API domain for the SuperTokens Core service'
	}),

	APP_NAME: str({ default: 'My App', desc: 'The name of your app or service' }),
	API_DOMAIN: url({ devDefault: `localhost:3000` }),
	API_BASE_PATH: str({ default: '/' }),
	WEB_DOMAIN: url({ devDefault: 'localhost:8080' }),

	SMTP_HOST: str({ example: 'email-smtp.eu-west-2.amazonaws.com' }),
	SMTP_PORT: port({ choices: [25, 465, 587, 1025, 2465, 2525, 2587] }),
	SMTP_USER: str({ devDefault: '' }),
	SMTP_PASS: str({ devDefault: '' }),
	SMTP_SENDFROM: str({ desc: 'The email address of the sender (your app)' })
});

export default appConfig;

export const DEFAULT_PAGE_LEN = 20;

export const WEB_EMAIL_VERIFY = `${appConfig.WEB_DOMAIN.replace(/\/$/, '')}${
	appConfig.API_BASE_PATH
}users/verify-email`;

export const WEB_STEAM_REDIRECT = `${appConfig.WEB_DOMAIN}/users/link/steam`;

export const WEB_TEAM_INVITE = `${appConfig.WEB_DOMAIN}/teams/join`;

export const WEB_RESET_PASSWORD = `${appConfig.WEB_DOMAIN}/users/reset-password`;
