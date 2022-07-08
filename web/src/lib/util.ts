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
