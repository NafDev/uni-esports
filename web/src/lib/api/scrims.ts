import type { IAcceptScrimDto, ICreateNewScrim, IOpenScrimRequest } from '@uni-esports/interfaces';
import { makeRequest } from './http';

export async function getOpenScrims(fetchWrapper?: typeof fetch) {
	const resp = await makeRequest<IOpenScrimRequest[]>('GET', '/scrims', undefined, {
		fetchWrapper
	});

	if (resp) {
		return resp.json;
	}
}

export async function createScrimRequest(body: ICreateNewScrim) {
	const resp = await makeRequest<{ id: number }>('POST', '/scrims/new', body);

	if (resp) {
		return resp.json;
	}
}

export async function acceptScrimRequest(body: IAcceptScrimDto) {
	const resp = await makeRequest<{ matchId: string }>('PATCH', '/scrims/accept', body);

	if (resp) {
		return resp.json;
	}
}
