import { getUserInfo } from '$/lib/api/users';
import { browser } from '$app/environment';
import type { AccessTokenPayload, IUserInfoDto } from '@uni-esports/interfaces';
import { atom, computed, map, onMount } from 'nanostores';
import { doesSessionExist } from 'supertokens-website';

export const user = atom<(AccessTokenPayload & { id: string }) | undefined>();
export const userInfo = map<IUserInfoDto>();
export const isSignedIn = computed(user, (user) => user !== undefined);

export function gracefulSignout() {
	user.off();
	userInfo.off();
	isSignedIn.off();

	user.set(undefined);

	window.location.assign('/');
}

if (browser) {
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
