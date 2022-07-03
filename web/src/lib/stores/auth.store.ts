import { atom, computed } from 'nanostores';
import type { AccessTokenPayload } from '@uni-esports/interfaces';

export const user = atom<(AccessTokenPayload & { id: string }) | undefined>();
export const isSignedIn = computed(user, (user) => user !== undefined);
