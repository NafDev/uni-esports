import { redirect, type HandleFetch } from '@sveltejs/kit';
import { BASE_API_URL } from '$/lib/config'

export const handleFetch = (({ request, event, fetch }) => {
	// `request` refers to the API endpoint being called in the load function
	// `event` refers to the webpage url the client is trying to load

  if (request.url.startsWith(BASE_API_URL)) {
		if (event.cookies.get('sFrontToken')?.length > 0 && !event.cookies.get('sAccessToken')) {
			throw redirect(302, `/users/refresh-session?redirect=${encodeURIComponent(event.url.href)}`)
		}
  }

  return fetch(request);
}) satisfies HandleFetch;