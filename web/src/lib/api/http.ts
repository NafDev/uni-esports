import axios, { type Options, type Response } from 'redaxios';
import { BASE_API_URL } from '$lib/config';
import { dev } from '$app/env';
import { pushNotification } from '$lib/stores/notifications.store';

export const enum HttpMethod {
	GET,
	POST,
	PUT,
	PATCH,
	DELETE
}

export const http = axios.create({
	baseURL: BASE_API_URL,
	withCredentials: true
});

export async function makeRequest<T>(
	method: HttpMethod,
	req: { url: string; body?: object; config?: Options },
	displayUiError = true
): Promise<Response<T> | false> {
	try {
		switch (method) {
			case HttpMethod.GET:
				return await http.get(req.url, req.config);
			case HttpMethod.POST:
				return await http.post(req.url, req.body, req.config);
			case HttpMethod.PUT:
				return await http.put(req.url, req.body, req.config);
			case HttpMethod.PATCH:
				return await http.patch(req.url, req.body, req.config);
			case HttpMethod.DELETE:
				return await http.delete(req.url, req.config);
		}
	} catch (error) {
		if (dev) {
			console.warn('Network request error', error);
		}

		if (Object.prototype.hasOwnProperty.call(error, 'ok')) {
			const erroredResponse = error as Response<{ message?: string }>;

			if (displayUiError) {
				console.warn(`Response code ${erroredResponse.status}`);

				pushNotification({
					message: erroredResponse.data.message ?? 'An error occurred with your request',
					type: 'danger'
				});
			}

			return false;
		}

		throw error;
	}
}
