import { pushNotification } from '$lib/stores/notifications';
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

export async function addUniDomain(uniId: number, domain: string) {
	const resp = await makeRequest<void>(
		HttpMethod.POST,
		{
			url: `/admin/universities/${uniId}/domains/add`,
			body: { domain }
		},
		true
	);

	if (resp) {
		pushNotification({
			message: 'Added university domain',
			type: 'success'
		});
	}
}

export async function removeUniDomain(uniId: number, domain: string) {
	const resp = await makeRequest<void>(
		HttpMethod.PATCH,
		{
			url: `/admin/universities/${uniId}/domains/remove`,
			body: { domain }
		},
		true
	);

	if (resp) {
		pushNotification({
			message: 'Removed university domain',
			type: 'success'
		});
	}
}

export async function updateUniName(uniId: number, name: string) {
	const resp = await makeRequest<void>(
		HttpMethod.PATCH,
		{
			url: `/admin/universities/${uniId}/name/update`,
			body: { name }
		},
		true
	);

	if (resp) {
		pushNotification({
			message: 'Updated university name',
			type: 'success'
		});
	}
}
