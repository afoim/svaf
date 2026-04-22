import { siteConfig } from '$lib/config/site';
import { getAllPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = getAllPosts();
	const baseUrl = siteConfig.url;

	// 静态页面
	const staticPages = [
		{ url: '/', priority: '1.0', changefreq: 'daily' },
		{ url: '/posts/', priority: '0.9', changefreq: 'daily' },
		{ url: '/cover/', priority: '0.7', changefreq: 'weekly' },
		{ url: '/timetable/', priority: '0.7', changefreq: 'weekly' },
		{ url: '/friends/', priority: '0.6', changefreq: 'monthly' },
		{ url: '/sponsors/', priority: '0.5', changefreq: 'monthly' }
	];

	// 文章页面
	const postPages = posts.map((post) => ({
		url: `/posts/${post.slug}/`,
		priority: '0.8',
		changefreq: 'weekly',
		lastmod: post.metadata.updated || post.metadata.published
	}));

	const allPages = [...staticPages, ...postPages];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
	.map(
		(page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
