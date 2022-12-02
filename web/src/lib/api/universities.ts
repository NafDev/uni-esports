import type { IUniversityAdminView, IUniversity } from '@uni-esports/interfaces';
import { HttpMethod, makeRequest } from './http';

export async function getUniList() {
	const resp = await makeRequest<IUniversity[]>(
		HttpMethod.GET,
		{ url: '/universities/list' },
		true
	);

	if (resp) {
		return resp.data;
	}
}

export async function getUniDetails(uniId: number) {
	const resp = await makeRequest<IUniversity & IUniversityAdminView>(
		HttpMethod.GET,
		{
			url: `/admin/universities/${uniId}`
		},
		true
	);

	if (resp) {
		return resp.data;
	}
}
