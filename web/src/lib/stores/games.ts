import { getGamesList } from '$lib/api/matches';
import type { GameListItem } from '@uni-esports/interfaces';
import { atom, keepMount, onMount, task } from 'nanostores';

export const gameStore = atom<Map<string, GameListItem>>(new Map());

onMount(gameStore, () => {
	task(async () => {
		const data = await getGamesList();
		if (data) {
			const gameMap = new Map<string, GameListItem>();

			for (const entry of data) {
				gameMap.set(entry.id, entry);
			}

			gameStore.set(gameMap);
		}
	});
});

keepMount(gameStore);
