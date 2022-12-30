import { BASE_API_URL } from '$/lib/config';
import { browser } from '$app/environment';
import { pushNotification } from '$lib/stores/notifications';
import { onDestroy, onMount } from 'svelte';

type HttpResponse<T> = {
	readonly status: number;
	readonly url: string;
	readonly json?: T extends void ? undefined : T;
};

export async function makeRequest<T>(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	url: string,
	body?: Record<string, any>,
	options?: {
		config?: RequestInit;
		displayUiError?: boolean;
		fetchWrapper?: typeof fetch;
	}
): Promise<HttpResponse<T> | false> {
	const config = options?.config ?? {};
	const displayUiError = options?.displayUiError ?? true;
	const http = options?.fetchWrapper ?? fetch;

	const json = body ? JSON.stringify(body) : undefined;

	const reqUrl = url.startsWith('/') ? BASE_API_URL + url : BASE_API_URL + '/' + url;

	if (method === 'GET' && json) {
		throw new Error('Cannot attach request body to GET request');
	}

	try {
		const response = await http(reqUrl, {
			method,
			body: json,
			...config,
			headers: { 'Content-Type': 'application/json; charset=utf-8', ...config.headers }
		});

		let data;

		try {
			data = (await response.json()) as T;
		} catch (error: unknown) {
			if (!(error instanceof SyntaxError)) {
				throw error;
			}
		}

		if (response.ok) {
			return { status: response.status, url: response.url, json: data };
		}

		if (response.status >= 400) {
			if (displayUiError) {
				pushNotification({
					message: data?.message ?? 'An error occurred with your request',
					type: 'danger'
				});
			}

			return false;
		}

		return { status: response.status, url: response.url };
	} catch (error) {
		console.error(error);
	}
}
type EventSourceListener = {
	type: string;
	fn: (this: EventSource, event: MessageEvent<any>) => void;
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
