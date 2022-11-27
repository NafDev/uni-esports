import { atom, computed, map, onMount, onSet } from 'nanostores';
import type { AccessTokenPayload, IUserInfoDto } from '@uni-esports/interfaces';
import { getUserInfo } from '$/lib/api/users';
import { browser } from '$app/environment';

export const user = atom<(AccessTokenPayload & { id: string }) | undefined>();
export const userInfo = map<IUserInfoDto>();
export const isSignedIn = computed(user, (user) => user !== undefined);

if (browser) {
	onSet(user, ({ newValue }) => {
		if (!newValue) {
			window.location.assign('/');
		}
	});

	onMount(userInfo, () => {
		getUserInfo().then((res) => {
			userInfo.set(res);
		});
	});
}
