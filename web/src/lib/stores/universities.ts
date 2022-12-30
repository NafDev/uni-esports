import { browser } from '$app/environment';
import type { IUniversity } from '@uni-esports/interfaces';
import { atom, keepMount, onMount, task } from 'nanostores';
import { getUniList } from '../api/universities';

export const universityStore = atom<Map<number, IUniversity>>(new Map());

if (browser) {
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
}
