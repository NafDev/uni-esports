import { customAlphabet } from 'nanoid';

const alphanumeric = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const nanoDbId = customAlphabet(alphanumeric, 24);
export const passwordResetToken = customAlphabet(alphanumeric, 64);
