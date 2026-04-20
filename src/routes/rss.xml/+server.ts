import { siteConfig } from '$lib/config/site';
import { getAllPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = async () => {
	const posts = await getAllPosts();
	
	// 只包含已发布的文章，按日期排序
	const publishedPosts = posts
		.filter(post => !post.metadata.draft)
		.sort((a, b) => new Date(b.metadata.published).getTime() - new Date(a.metadata.published).getTime());

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${siteConfig.title}</title>
		<description>${siteConfig.description}</description>
		<link>${siteConfig.url}</link>
		<atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml"/>
		<language>zh-CN</language>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		${publishedPosts.map(post => `
		<item>
			<title>${escapeXml(post.metadata.title)}</title>
			<description>${escapeXml(post.metadata.description)}</description>
			<link>${siteConfig.url}/posts/${post.slug}/</link>
			<guid isPermaLink="true">${siteConfig.url}/posts/${post.slug}/</guid>
			<pubDate>${new Date(post.metadata.published).toUTCString()}</pubDate>
			${post.metadata.image ? `<enclosure url="${siteConfig.url}${post.metadata.image}" type="image/webp"/>` : ''}
		</item>`).join('')}
	</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};

function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
