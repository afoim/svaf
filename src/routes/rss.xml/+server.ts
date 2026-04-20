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

	// 动态导入文章内容并渲染为 HTML
	const postsWithContent = await Promise.all(
		publishedPosts.map(async (post) => {
			try {
				// 导入文章的 mdsvex 组件
				const module = await import(`../../../content/posts/${post.slug}/index.md`);
				// 获取渲染后的 HTML
				const html = module.default.render().html;
				return { ...post, html };
			} catch (error) {
				console.error(`Failed to load content for ${post.slug}:`, error);
				return { ...post, html: post.metadata.description };
			}
		})
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
	<channel>
		<title>${escapeXml(siteConfig.title)}</title>
		<description>${escapeXml(siteConfig.bio.bio)}</description>
		<link>${siteConfig.url}/</link>
		<language>zh_CN</language>
		${postsWithContent.map(post => `
		<item>
			<title>${escapeXml(post.metadata.title)}</title>
			<link>${siteConfig.url}/posts/${post.slug}/</link>
			<guid isPermaLink="true">${siteConfig.url}/posts/${post.slug}/</guid>
			<description>${escapeXml(post.metadata.description)}</description>
			<pubDate>${new Date(post.metadata.published).toUTCString()}</pubDate>
			<content:encoded><![CDATA[${post.html}]]></content:encoded>
		</item>`).join('')}
	</channel>
</rss>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
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
