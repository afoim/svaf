import { Feed } from 'feed';
import { siteConfig } from '$lib/config/site';
import { getAllPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

// 预加载所有文章模块，同时获取原始内容
const modules = import.meta.glob('/src/content/posts/**/index.md', { 
	eager: true,
	query: '?raw',
	import: 'default'
});

export const GET: RequestHandler = async () => {
	const posts = await getAllPosts();
	
	// 只包含已发布的文章，按日期排序
	const publishedPosts = posts
		.filter(post => !post.metadata.draft)
		.sort((a, b) => new Date(b.metadata.published).getTime() - new Date(a.metadata.published).getTime());

	// 创建 Feed 实例
	const feed = new Feed({
		title: siteConfig.title,
		description: siteConfig.bio.bio,
		id: siteConfig.url,
		link: siteConfig.url,
		language: 'zh-CN',
		favicon: `${siteConfig.url}${siteConfig.icon}`,
		copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.bio.name}`,
		feedLinks: {
			rss: `${siteConfig.url}/rss.xml`,
		},
		author: {
			name: siteConfig.bio.name,
			link: siteConfig.url
		}
	});

	// 添加文章到 feed
	for (const post of publishedPosts) {
		const modulePath = `/src/content/posts/${post.slug}/index.md`;
		const rawContent = modules[modulePath];

		// 移除 frontmatter，获取正文
		let content = '';
		if (typeof rawContent === 'string' && rawContent.length > 0) {
			const parts = rawContent.split('---');
			if (parts.length >= 3) {
				content = parts.slice(2).join('---').trim();
			} else {
				content = rawContent.trim();
			}
		}

		// 清理 CDATA 中的非法字符，避免 xml-js writeCdata 崩溃
		const sanitize = (s: unknown): string => {
			if (typeof s !== 'string') return '';
			// 去除 XML 1.0 不允许的控制字符
			return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
		};

		const safeTitle = sanitize(post.metadata.title) || post.slug;
		const safeDescription = sanitize(post.metadata.description);
		const safeContent = sanitize(content) || safeDescription || safeTitle;

		const publishedDate = new Date(post.metadata.published);
		const safeDate = isNaN(publishedDate.getTime()) ? new Date() : publishedDate;

		feed.addItem({
			title: safeTitle,
			id: `${siteConfig.url}/posts/${post.slug}/`,
			link: `${siteConfig.url}/posts/${post.slug}/`,
			description: safeDescription || safeTitle,
			content: safeContent,
			date: safeDate,
			image: post.metadata.image ? `${siteConfig.url}${post.metadata.image}` : undefined
		});
	}

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
