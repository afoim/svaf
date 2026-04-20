import type { Post, PostMetadata } from '$lib/types/post';

// 导入所有 markdown 文件
const postFiles = import.meta.glob('/src/content/posts/*.md', { eager: true, query: '?raw', import: 'default' });

/**
 * 解析 markdown 文件的 frontmatter
 */
function parseFrontmatter(content: string): { metadata: PostMetadata; content: string } {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		throw new Error('Invalid markdown format: missing frontmatter');
	}

	const frontmatterText = match[1];
	const markdownContent = match[2];

	// 解析 YAML frontmatter
	const metadata: Partial<PostMetadata> = {};
	const lines = frontmatterText.split('\n');

	for (const line of lines) {
		const colonIndex = line.indexOf(':');
		if (colonIndex === -1) continue;

		const key = line.slice(0, colonIndex).trim();
		let value: string | boolean = line.slice(colonIndex + 1).trim();

		// 处理布尔值
		if (value === 'true') value = true;
		if (value === 'false') value = false;

		metadata[key as keyof PostMetadata] = value as any;
	}

	return {
		metadata: metadata as PostMetadata,
		content: markdownContent.trim()
	};
}

/**
 * 获取所有文章
 */
export function getAllPosts(): Post[] {
	const posts: Post[] = [];

	for (const [path, content] of Object.entries(postFiles)) {
		const slug = path.split('/').pop()?.replace('.md', '') || '';
		const { metadata, content: markdownContent } = parseFrontmatter(content as string);

		posts.push({
			slug,
			metadata,
			content: markdownContent
		});
	}

	// 按发布日期排序，置顶文章优先
	return posts.sort((a, b) => {
		if (a.metadata.pinned && !b.metadata.pinned) return -1;
		if (!a.metadata.pinned && b.metadata.pinned) return 1;
		return new Date(b.metadata.published).getTime() - new Date(a.metadata.published).getTime();
	});
}

/**
 * 根据 slug 获取单篇文章
 */
export function getPostBySlug(slug: string): Post | undefined {
	const posts = getAllPosts();
	return posts.find((post) => post.slug === slug);
}
