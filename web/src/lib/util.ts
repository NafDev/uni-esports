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
	reject: (reason?: any) => void;
	resolve: (value: unknown) => void;

	constructor() {
		this.promise = new Promise((resolve, reject) => {
			this.reject = reject;
			this.resolve = resolve;
		});
	}
}

export function stripEmptyStrings(obj: Record<string, any>) {
	const newObj = {};

	for (const [k, v] of Object.entries(obj)) {
		if (typeof v === 'string' && v.length === 0) {
			continue;
		}

		newObj[`${k}`] = v;
	}

	return newObj;
}
