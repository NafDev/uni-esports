import { persistentAtom } from '@nanostores/persistent';
import type { IUniversity } from '@uni-esports/interfaces';
import { keepMount, onMount, task } from 'nanostores';
import { getUniList } from '../api/universities';

export const universityStore = persistentAtom<Map<number, IUniversity>>('universities', new Map(), {
	encode: (map) => JSON.stringify([...map]),
	decode: (strValue) => new Map(JSON.parse(strValue))
});

onMount(universityStore, () => {
	task(async () => {
		const data = await getUniList();
		if (data) {
			const uniMap = new Map<number, IUniversity>();

			for (const entry of data) {
				uniMap.set(entry.id, entry);
			}

			universityStore.set(uniMap);
		}
	});
});

keepMount(universityStore);
