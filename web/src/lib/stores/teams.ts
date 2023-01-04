import { getUserTeams } from '$/lib/api/users';
import { browser } from '$app/environment';
import type { TeamDto } from '@uni-esports/interfaces';
import { atom, onMount } from 'nanostores';

export const playerTeams = atom<TeamDto[]>();

if (browser) {
	onMount(playerTeams, () => {
		getUserTeams().then((res) => {
			playerTeams.set(res);
		});
	});
}
