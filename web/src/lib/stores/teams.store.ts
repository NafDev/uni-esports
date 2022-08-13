import { browser } from '$app/env';
import { getUserTeams } from '$lib/api/users';
import type { TeamDto } from '@uni-esports/interfaces';
import { atom, onMount } from 'nanostores';

export const playerTeams = atom<TeamDto[]>();

if (browser) {
	onMount(playerTeams, async () => {
		getUserTeams().then((res) => {
			playerTeams.set(res);
		});
	});
}
