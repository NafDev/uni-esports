import { atom, computed, map, onMount, onSet } from 'nanostores';
import type { AccessTokenPayload, IUserInfoDto } from '@uni-esports/interfaces';
import { getUserInfo } from '$/lib/api/users';
import { browser } from '$app/environment';
import { doesSessionExist } from 'supertokens-website';

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
		doesSessionExist().then((sessionExists) => {
			if (sessionExists) {
				getUserInfo().then((res) => {
					userInfo.set(res);
				});
			}
		});
	});
}
