import type { ForumCategory } from '../types/post';
import { forumRequest } from './client';

interface RawCategory {
	id: string | number;
	name?: string;
	slug?: string;
	description?: string;
}

function normalizeCategory(c: RawCategory): ForumCategory {
	return {
		id: String(c.id),
		name: c.name || '未命名分类',
		slug: c.slug,
		description: c.description
	};
}

export async function getCategories(): Promise<ForumCategory[]> {
	const result = await forumRequest<
		RawCategory[] | { items?: RawCategory[]; categories?: RawCategory[] }
	>('/api/categories');
	const list = Array.isArray(result) ? result : result.items || result.categories || [];
	return list.map(normalizeCategory);
}
