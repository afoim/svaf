import { building } from '$app/environment';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const start = Date.now();
	const response = await resolve(event);
	if (building) {
		const ms = Date.now() - start;
		console.log(`[prerender] ${event.url.pathname} -> ${response.status} (${ms}ms)`);
	}
	return response;
}
