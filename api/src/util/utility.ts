import { createHash } from 'node:crypto';
import { customAlphabet } from 'nanoid';
import capitalize from 'lodash.capitalize';
import { DEFAULT_PAGE_LEN } from '../config/app.config';

/**
 * @param input String to hash
 * @returns Input hashed with SHA265 in hexadecimal form
 */
export function sha265hex(input: string) {
	return createHash('sha256').update(input).digest('hex');
}

const alphanumericChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Create a random alphanumeric string (of default length 128 characters)
 */
export const createToken = customAlphabet(alphanumericChars, 128);

/**
 * `Skip` and `take` parameters to spread into Prisma select query options
 * @param page Defaults to 1
 * @param pageLength Defaults to constant in `appConfig`
 */
export const prismaPaginationSkipTake = (page = 1, pageLength = DEFAULT_PAGE_LEN) => {
	return { take: pageLength, skip: pageLength * (page - 1) };
};

export const capitalizeFirstLetter = (input: string | undefined) => {
	if (typeof input !== 'string' || input.length === 0) return;
	return input.charAt(0).toUpperCase() + input.slice(1);
};
