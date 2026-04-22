import { getAllPosts, getPostBySlug, getPostComponent } from '$lib/utils/posts';
import { resolvePostAssetPath } from '$lib/utils/markdown';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => {
	return getAllPosts().map((post) => ({ slug: post.slug }));
};

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

	// 处理元数据中的图片路径
	const metadata = {
		...post.metadata,
		image: resolvePostAssetPath(params.slug, post.metadata.image)
	};

	return {
		post: {
			...post,
			metadata
		},
		component,
		slug: params.slug
	};
};
