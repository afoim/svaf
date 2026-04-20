import { getAllPosts } from '$lib/utils/posts';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	const posts = getAllPosts();

	return {
		posts
	};
};
