import { atom, computed, map } from 'nanostores';
import type { AccessTokenPayload, IUserInfoDto } from '@uni-esports/interfaces';

export const user = atom<(AccessTokenPayload & { id: string }) | undefined>();
export const isSignedIn = computed(user, (user) => user !== undefined);

export const userInfo = map<IUserInfoDto>();
