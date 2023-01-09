import type {
	GameListItem,
	IGameMatchResult,
	IMatchInfo,
	IUpcomingMatch,
	MatchService,
	Pagination,
	VetoRequest
} from '@uni-esports/interfaces';
import { makeRequest } from './http';

export async function getGamesList(fetchWrapper?: typeof fetch) {
	const res = await makeRequest<GameListItem[]>('GET', '/games/list', undefined, {
		displayUiError: false,
		fetchWrapper
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

export function sendVetoRequest(matchId: string, body: VetoRequest) {
	void makeRequest<void>('POST', `/matches/${matchId}/veto/request`, body);
}

export async function getRecentMatchResults(
	gameId: string,
	page: number,
	limit: number,
	fetchWrapper?: typeof fetch
) {
	const res = await makeRequest<Pagination<IGameMatchResult>>(
		'GET',
		`games/${gameId}/recent-matches?page=${page}&limit=${limit}`,
		undefined,
		{ fetchWrapper }
	);

	if (res) {
		return res.json;
	}
}
