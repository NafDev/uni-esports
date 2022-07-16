import { dev } from '$app/env';

export const BASE_API_URL = dev ? 'http://localhost:3000' : 'https://ukue.app';

export const USERNAME_PROMPT =
	'Your username should be 3-24 characters long and may only include alphanumeric characters, underscores, hypens, and full stops';
export const USERNAME_CHECK = /^[\w-.]{3,24}$/;

export const PASSWORD_PROMPT =
	'Your password must be at least 6 characters long and include one number, one capital letter, and one special character <a class="font-mono bg-black bg-opacity-30 px-1">#?!@$%^&*-_</a>';
export const PASSWORD_CHECK = (value: string) => {
	return (
		value.length >= 6 &&
		/[#?!@$%^&*\-_]+/.test(value) &&
		/[\d]+/.test(value) &&
		/[A-Z]+/.test(value)
	);
};
