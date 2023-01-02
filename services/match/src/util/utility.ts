import { customAlphabet } from 'nanoid';

const alphanumericChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Create a random alphanumeric string (of default length 128 characters)
 */
export const createToken = customAlphabet(alphanumericChars, 128);
