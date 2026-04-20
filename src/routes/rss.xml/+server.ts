import { Feed } from 'feed';
import { siteConfig } from '$lib/config/site';
import { getAllPosts } from '$lib/utils/posts';
import type { RequestHandler } from './$types';

export const prerender = true;

// 预加载所有文章模块 - 使用与 getAllPosts 相同的模式
const modules = import.meta.glob('/src/content/posts/**/index.md', { eager: true });

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
		try {
			const modulePath = `/src/content/posts/${post.slug}/index.md`;
			const module = modules[modulePath] as any;
			
			let content = `<p>${post.metadata.description}</p>`;
			
			if (module && module.default && module.default.render) {
				try {
					content = module.default.render().html;
				} catch (renderError) {
					console.error(`Failed to render ${post.slug}:`, renderError);
				}
			}

			feed.addItem({
				title: post.metadata.title,
				id: `${siteConfig.url}/posts/${post.slug}/`,
				link: `${siteConfig.url}/posts/${post.slug}/`,
				description: post.metadata.description,
				content: content,
				date: new Date(post.metadata.published),
				image: post.metadata.image ? `${siteConfig.url}${post.metadata.image}` : undefined
			});
		} catch (error) {
			console.error(`Failed to add post ${post.slug} to feed:`, error);
		}
	}

	return new Response(feed.rss2(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
