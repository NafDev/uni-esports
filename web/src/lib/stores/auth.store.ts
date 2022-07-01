import { atom, computed } from 'nanostores';
import type { AccessTokenPayload, IUserInfoDto } from '@uni-esports/interfaces';

export const user = atom<(AccessTokenPayload & IUserInfoDto) | undefined>();
export const isSignedIn = computed(user, (user) => user !== undefined);
