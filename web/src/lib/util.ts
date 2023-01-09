/**
 * https://stackoverflow.com/a/8831937
 * @param value String to hash
 * @returns Hash code of string
 */
export function hashCode(value: string) {
	let hash = 0;
	for (let i = 0, len = value.length; i < len; i++) {
		const chr = value.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0;
	}
	return hash;
}

export class Deferred {
	promise: Promise<unknown>;
	reject: (reason?: unknown) => void;
	resolve: (value: unknown) => void;

	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.reject = reject;
			this.resolve = resolve;
		});
	}
}

export function stripEmptyStrings(obj: Record<string, any>) {
	if (obj === undefined) {
		return undefined;
	}

	const newObj = {};

	for (const [k, v] of Object.entries(obj)) {
		if (typeof v === 'string' && v.length === 0) {
			continue;
		}

		newObj[`${k}`] = v;
	}

	return newObj;
}

/**
 * Format seconds to hh:mm:ss
 *
 * Adapted from https://stackoverflow.com/a/9934957
 */
export const formatSeconds = (secs: number) => {
	const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

	let str = '';

	const h = Math.floor(secs / 3600);
	if (h > 0) str += pad(h) + ':';

	const m = Math.floor(secs / 60) - h * 60;
	if (m > 0 || str.length !== 0) str += pad(m) + ':';

	const s = Math.floor(secs - h * 3600 - m * 60);
	if (s > 0 || str.length !== 0) str += pad(s);

	return str;
};
