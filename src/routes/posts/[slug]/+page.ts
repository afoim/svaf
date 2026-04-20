import { getPostBySlug, getPostComponent } from '$lib/utils/posts';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const post = getPostBySlug(params.slug);

	if (!post) {
		throw error(404, '文章不存在');
	}

	// 获取 mdsvex 编译后的组件
	const component = await getPostComponent(params.slug);

	if (!component) {
		throw error(404, '文章内容加载失败');
	}

	return {
		post,
		component
	};
};
