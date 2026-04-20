import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { redirects } from '$lib/config/redirects';

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	
	// 检查是否有匹配的重定向规则
	if (path in redirects) {
		const { status, destination } = redirects[path];
		throw redirect(status as 301 | 302 | 303 | 307 | 308, destination);
	}
	
	return resolve(event);
};
