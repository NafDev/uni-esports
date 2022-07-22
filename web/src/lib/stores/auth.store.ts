import { atom, computed, map, onSet } from 'nanostores';
import type { AccessTokenPayload, IUserInfoDto } from '@uni-esports/interfaces';

export const user = atom<(AccessTokenPayload & { id: string }) | undefined>();
export const userInfo = map<IUserInfoDto>();
export const isSignedIn = computed(user, (user) => user !== undefined);

onSet(user, ({ newValue }) => {
	if (!newValue) {
		window.location.assign('/');
	}
});
