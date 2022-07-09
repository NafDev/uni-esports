import { dev } from '$app/env';

export const BASE_API_URL = dev ? 'http://localhost:3000' : 'https://ukue.app';

// Between 3 and 24 alphanumeric characters, may include _-.
export const USERNAME_CHECK = /^[\w-.]{3,24}$/;

// At least 6 characters long, include one number, one capital letter, one special character from #?!@$%^&*-
export const PASSWORD_CHECK = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;
