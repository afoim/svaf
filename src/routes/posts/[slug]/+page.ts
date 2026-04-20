import { getPostBySlug } from '$lib/utils/posts';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { marked } from 'marked';

export const load: PageLoad = ({ params }) => {
	const post = getPostBySlug(params.slug);

	if (!post) {
		throw error(404, '文章不存在');
	}

	// 将 markdown 转换为 HTML
	const html = marked(post.content);

	return {
		post,
		html
	};
};
