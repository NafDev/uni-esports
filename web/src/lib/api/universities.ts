import { pushNotification } from '$lib/stores/notifications';
import type { IUniversityAdminView, IUniversity } from '@uni-esports/interfaces';
import { makeRequest } from './http';

export async function getUniList() {
	const resp = await makeRequest<IUniversity[]>('GET', '/universities/list');

	if (resp) {
		return resp.json;
	}
}

export async function getUniDetails(uniId: number) {
	const resp = await makeRequest<IUniversity & IUniversityAdminView>(
		'GET',
		`/admin/universities/${uniId}`
	);

	if (resp) {
		return resp.json;
	}
}

export async function addUniDomain(uniId: number, domain: string) {
	const resp = await makeRequest<void>('POST', `/admin/universities/${uniId}/domains/add`, {
		domain
	});

	if (resp) {
		pushNotification({
			message: 'Added university domain',
			type: 'success'
		});
	}
}

export async function removeUniDomain(uniId: number, domain: string) {
	const resp = await makeRequest<void>('PATCH', `/admin/universities/${uniId}/domains/remove`, {
		domain
	});

	if (resp) {
		pushNotification({
			message: 'Removed university domain',
			type: 'success'
		});
	}
}

export async function updateUniName(uniId: number, name: string) {
	const resp = await makeRequest<void>('PATCH', `/admin/universities/${uniId}/name/update`, {
		name
	});

	if (resp) {
		pushNotification({
			message: 'Updated university name',
			type: 'success'
		});
	}
}
