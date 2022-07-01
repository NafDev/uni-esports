import axios, { type Options, type Response } from 'redaxios';
import { BASE_API_URL } from '$lib/config';

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
	displayUiError: boolean
): Promise<Response<T>> {
	try {
		switch (method) {
			case HttpMethod.GET:
				return http.get(req.url, req.config);
			case HttpMethod.POST:
				return http.post(req.url, req.body, req.config);
			case HttpMethod.PUT:
				return http.put(req.url, req.body, req.config);
			case HttpMethod.PATCH:
				return http.patch(req.url, req.body, req.config);
			case HttpMethod.DELETE:
				return http.delete(req.url, req.config);
		}
	} catch (error) {
		console.log('Error during HTTP request');

		if (displayUiError) {
			// Probably add some UI notification logic here
		}
		throw error;
	}
}
