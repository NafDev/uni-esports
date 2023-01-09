import { BASE_API_URL } from '$/lib/config';
import { browser, dev } from '$app/environment';
import { goto } from '$app/navigation';
import { pushNotification } from '$lib/stores/notifications';
import SuperTokens from 'supertokens-website';
import { onDestroy, onMount } from 'svelte';

async function httpRequest(url: string, reqInit: RequestInit, http: typeof fetch) {
	const response = await http(url, reqInit);

	let data;

	try {
		data = await response.json();
	} catch (error: unknown) {
		if (!(error instanceof SyntaxError)) {
			throw error;
		}
	}

	return { status: response.status, url: response.url, ok: response.ok, json: data };
}

export async function makeRequest<T>(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	url: string,
	body?: Record<string, any>,
	options?: {
		config?: RequestInit;
		displayUiError?: boolean;
		fetchWrapper?: typeof fetch;
	}
) {
	const config = options?.config ?? {};
	const displayUiError = options?.displayUiError ?? true;
	const http = options?.fetchWrapper ?? fetch;

	const json = body ? JSON.stringify(body) : undefined;

	const reqUrl = url.startsWith('/') ? BASE_API_URL + url : BASE_API_URL + '/' + url;

	if (method === 'GET' && json) {
		throw new Error('Cannot attach request body to GET request');
	}

	const requestOptions: RequestInit = {
		method,
		body: json,
		...config,
		credentials: dev ? 'include' : 'same-origin',
		headers: { 'Content-Type': 'application/json; charset=utf-8', ...config.headers }
	};

	let response = await httpRequest(reqUrl, requestOptions, http);

	if (browser && response.status === 511) {
		try {
			const refreshSuccess = await SuperTokens.attemptRefreshingSession();

			if (refreshSuccess) {
				response = await httpRequest(reqUrl, requestOptions, http);
			}
		} catch (error: unknown) {
			await goto('/users/signin');
		}
	}

	if (!response.ok) {
		if (browser && displayUiError) {
			pushNotification({
				message: response.json?.message ?? 'An error occurred with your request',
				type: 'danger'
			});
		}

		return false;
	}

	return { ...response, json: response.json as T };
}

type EventSourceListener = {
	type: string;
	fn: (this: EventSource, event: MessageEvent<unknown>) => void;
	options?: boolean | AddEventListenerOptions;
};

export function sse(endpoint: string, ...listeners: Array<EventSourceListener>) {
	let eventSource: EventSource | undefined;

	onMount(() => {
		const reqUrl = endpoint.startsWith('/')
			? BASE_API_URL + endpoint
			: BASE_API_URL + '/' + endpoint;
		eventSource = new EventSource(reqUrl, { withCredentials: true });

		for (const listener of listeners) {
			eventSource.addEventListener(listener.type, listener.fn, listener.options);
		}
	});

	if (browser) {
		onDestroy(() => {
			if (eventSource) eventSource.close();
		});
	}

	return eventSource;
}
