import { persistentAtom } from '@nanostores/persistent';
export const testStore = persistentAtom<string>('test', undefined);
