import type {
	GameListItem,
	IMatchInfo,
	IUpcomingMatch,
	MatchService
} from '@uni-esports/interfaces';
import { makeRequest } from './http';

export async function getGamesList() {
	const res = await makeRequest<GameListItem[]>('GET', '/games/list', undefined, {
		displayUiError: false
	});

	if (res) {
		return res.json;
	}
}

export async function getMatchInfo(id: string, fetchWrapper?: typeof fetch) {
	const res = await makeRequest<IMatchInfo>('GET', `/matches/${id}`, undefined, { fetchWrapper });

	if (res) {
		return res.json;
	}
}

export async function getUpcomingMatches(onlyForMe = true) {
	const res = await makeRequest<IUpcomingMatch[]>('GET', `/matches/upcoming?me=${onlyForMe}`);

	if (res) {
		return res.json;
	}
}

export async function getVetoStatus(matchId: string, fetchWrapper: typeof fetch) {
	const res = await makeRequest<MatchService['match.veto.status']['res']>(
		'GET',
		`/matches/${matchId}/veto/status`,
		undefined,
		{ fetchWrapper }
	);

	if (res) {
		return res.json;
	}
}
