import { browser } from '$app/environment';
import { getGamesList } from '$lib/api/matches';
import type { GameListItem } from '@uni-esports/interfaces';
import { atom, keepMount, onMount, task } from 'nanostores';

export const gameStore = atom<Map<string, GameListItem>>(new Map());

if (browser) {
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
}

// Backup placeholders during SSR
export function gameName(gameId: string) {
	switch (gameId.toLowerCase()) {
		case 'csgo':
			return 'Counter-Strike: Global Offensive';
		case 'valorant':
		case 'val':
			return 'Valorant';
		case 'league':
			return 'League of Legends';
		default:
			console.warn(`Unknown game ID - ${gameId}`);
			return '';
	}
}
