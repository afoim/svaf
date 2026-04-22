import { siteConfig } from '$lib/config/site';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const robots = `User-agent: *
Allow: /

Sitemap: ${siteConfig.url}/sitemap.xml
`;

	return new Response(robots, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
