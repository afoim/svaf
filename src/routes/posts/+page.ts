import { getAllPosts } from '$lib/utils/posts';
import { resolvePostAssetPath } from '$lib/utils/markdown';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	const posts = getAllPosts().map(post => ({
		...post,
		metadata: {
			...post.metadata,
			image: resolvePostAssetPath(post.slug, post.metadata.image)
		}
	}));

	return {
		posts
	};
};
