import { persistentAtom } from '@nanostores/persistent';
import { computed } from 'nanostores';
import SuperTokens from 'supertokens-website';

interface IUser {
	id: string;
}

export const authUser = persistentAtom<IUser | undefined>('user', undefined, {
	encode: JSON.stringify,
	decode: JSON.parse
});

// Get active user payload from cookies if exists else null
export async function getActiveUser(payload?: object): Promise<IUser | undefined> {
	console.log('FETCHING ACTIVE USER');

	try {
		const tokenPayload = payload || (await SuperTokens.getAccessTokenPayloadSecurely());
		const uid = await SuperTokens.getUserId();
		return { ...tokenPayload, uid };
	} catch (error) {
		console.warn(`Failed to fetch user`, error);
		return;
	}
}

export const isAuthed = computed(authUser, (user) => Boolean(user));
