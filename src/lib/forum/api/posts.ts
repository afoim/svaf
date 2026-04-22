import type { ApiListResult } from '../types/api';
import type { ForumPostSummary } from '../types/post';
import { extractFirstImageUrlFromMarkdown } from '../utils/markdown';
import { forumRequest } from './client';

interface RawPostRecord {
	id: string | number;
	author_id?: string | number;
	title?: string;
	slug?: string;
	excerpt?: string;
	content?: string;
	category_id?: string | number;
	category_name?: string | null;
	author_name?: string;
	author_avatar?: string | null;
	author_role?: string;
	category?: ForumPostSummary['category'];
	author?: ForumPostSummary['author'];
	view_count?: number;
	comment_count?: number;
	like_count?: number;
	liked?: boolean;
	is_pinned?: number | boolean;
	created_at?: string;
	updated_at?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface RawPostListResult {
	items?: RawPostRecord[];
	posts?: RawPostRecord[];
	data?: RawPostRecord[];
	total?: number;
	page?: number;
	pageSize?: number;
}

function normalizePost(post: RawPostRecord): ForumPostSummary {
	const coverImageUrl =
		extractFirstImageUrlFromMarkdown(post.content) ||
		extractFirstImageUrlFromMarkdown(post.excerpt);
	return {
		id: String(post.id),
		authorId: post.author_id !== undefined ? String(post.author_id) : undefined,
		title: post.title || '未命名帖子',
		slug: post.slug,
		excerpt: post.excerpt,
		content: post.content,
		coverImageUrl,
		categoryId: post.category_id !== undefined ? String(post.category_id) : undefined,
		category:
			post.category ||
			(post.category_name
				? { id: String(post.category_id || ''), name: post.category_name }
				: null),
		author:
			post.author ||
			(post.author_name || post.author_avatar
				? {
						id: post.author_id !== undefined ? String(post.author_id) : '',
						username: post.author_name || '匿名',
						displayName: post.author_name || '匿名',
						avatarUrl: post.author_avatar || undefined,
						role: post.author_role
					}
				: null),
		viewCount: post.view_count,
		commentCount: post.comment_count,
		likeCount: post.like_count,
		liked: post.liked,
		isPinned: Boolean(post.is_pinned),
		createdAt: post.createdAt || post.created_at,
		updatedAt: post.updatedAt || post.updated_at
	};
}

export interface ForumPostListQuery {
	page?: number;
	pageSize?: number;
	search?: string;
	category?: string;
	sort?: string;
}

function normalizePostListQuery(query: ForumPostListQuery) {
	const sortMap: Record<string, string> = {
		latest: 'time',
		oldest: 'time_asc',
		likes: 'likes',
		comments: 'comments',
		views: 'views'
	};
	const page = Math.max(1, query.page || 1);
	const limit = query.pageSize;
	const offset = limit ? (page - 1) * limit : undefined;
	return {
		limit,
		offset,
		q: query.search,
		category_id: query.category,
		sort_by: query.sort ? sortMap[query.sort] || query.sort : undefined
	};
}

export async function getPosts(
	query: ForumPostListQuery = {}
): Promise<ApiListResult<ForumPostSummary> | ForumPostSummary[]> {
	const result = await forumRequest<RawPostListResult | RawPostRecord[]>('/api/posts', {
		query: normalizePostListQuery(query)
	});
	if (Array.isArray(result)) return result.map(normalizePost);
	const list = result.posts || result.items || result.data || [];
	return {
		items: list.map(normalizePost),
		total: result.total,
		page: result.page,
		pageSize: result.pageSize
	};
}

export interface NewPostCountResult {
	new_post_count: number;
	last_seen_at: string | null;
}

export function getNewPostCount(): Promise<NewPostCountResult> {
	return forumRequest<NewPostCountResult>('/api/posts/new-count', { requiresAuth: true });
}
