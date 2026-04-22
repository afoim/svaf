import { ForumApiError } from '../types/api';
import type { ApiListResult } from '../types/api';
import type { ForumPostSummary } from '../types/post';
import type { ForumUser, ForumUserGender } from '../types/user';
import { extractFirstImageUrlFromMarkdown } from '../utils/markdown';
import { forumRequest } from './client';
import type { ForumPostListQuery } from './posts';

interface RawUserRecord {
	id: string | number;
	username?: string;
	display_name?: string;
	displayName?: string;
	avatar_url?: string | null;
	avatarUrl?: string | null;
	bio?: string | null;
	gender?: string | null;
	age?: number | string | null;
	region?: string | null;
	role?: string | number;
	is_admin?: boolean | number;
	created_at?: string;
	createdAt?: string;
	verified?: boolean | number;
	email_verified?: boolean | number;
	emailVerified?: boolean | number;
}

interface RawUserProfileResult {
	user?: RawUserRecord | null;
	data?: RawUserRecord | { user?: RawUserRecord | null } | null;
}

interface RawUserPostRecord {
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

interface RawUserPostListResult {
	posts?: RawUserPostRecord[];
	items?: RawUserPostRecord[];
	data?: RawUserPostRecord[];
	total?: number;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	if (typeof value === 'string') {
		const n = value.trim().toLowerCase();
		if (['1', 'true', 'yes', 'on', 'enabled'].includes(n)) return true;
		if (['0', 'false', 'no', 'off', 'disabled'].includes(n)) return false;
	}
	return undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
	if (typeof value === 'string') {
		const n = value.trim();
		if (!n) return undefined;
		const p = Number(n);
		return Number.isFinite(p) ? p : undefined;
	}
	return undefined;
}

function normalizeGender(value: unknown): ForumUserGender | undefined {
	if (typeof value !== 'string') return undefined;
	const n = value.trim();
	if (['male', 'female', 'other', 'prefer_not_to_say'].includes(n))
		return n as ForumUserGender;
	return undefined;
}

function normalizeRole(user?: RawUserRecord | null) {
	if (!user) return undefined;
	if (user.is_admin === true || user.is_admin === 1) return 'admin';
	const r = user.role;
	if (typeof r === 'number') return r === 1 ? 'admin' : String(r);
	if (typeof r === 'string') {
		const n = r.trim().toLowerCase();
		if (['admin', 'administrator', 'root', 'superadmin', 'super_admin'].includes(n))
			return 'admin';
		return n;
	}
	return undefined;
}

function normalizeUser(user?: RawUserRecord | null): ForumUser | null {
	if (!user) return null;
	return {
		id: String(user.id),
		username: user.username || '用户',
		displayName: user.display_name || user.displayName || user.username || '用户',
		avatarUrl: user.avatar_url || user.avatarUrl || undefined,
		bio: user.bio?.trim() || undefined,
		gender: normalizeGender(user.gender),
		age: toOptionalNumber(user.age),
		region: user.region?.trim() || undefined,
		role: normalizeRole(user),
		createdAt: user.created_at || user.createdAt,
		verified: toOptionalBoolean(
			user.verified ?? user.email_verified ?? user.emailVerified
		)
	};
}

function normalizeUserPostsQuery(query: ForumPostListQuery) {
	const sortMap: Record<string, { sort_by?: string; sort_dir?: string }> = {
		latest: { sort_by: 'created_at', sort_dir: 'desc' },
		oldest: { sort_by: 'created_at', sort_dir: 'asc' },
		likes: { sort_by: 'like_count', sort_dir: 'desc' },
		comments: { sort_by: 'comment_count', sort_dir: 'desc' },
		views: { sort_by: 'view_count', sort_dir: 'desc' }
	};
	const page = Math.max(1, query.page || 1);
	const limit = query.pageSize;
	const offset = limit ? (page - 1) * limit : undefined;
	const sort = query.sort
		? sortMap[query.sort] || { sort_by: query.sort, sort_dir: 'desc' }
		: undefined;
	return { limit, offset, sort_by: sort?.sort_by, sort_dir: sort?.sort_dir };
}

function normalizeUserPost(post: RawUserPostRecord): ForumPostSummary {
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

function resolveProfileUser(result: RawUserRecord | RawUserProfileResult) {
	if ('id' in result) return result;
	if (result.user) return result.user;
	if (result.data && 'id' in result.data) return result.data;
	if (result.data && typeof result.data === 'object' && 'user' in result.data)
		return result.data.user ?? null;
	return null;
}

export async function getUserProfile(userId: string): Promise<ForumUser> {
	const result = await forumRequest<RawUserRecord | RawUserProfileResult>(
		`/api/users/${userId}`
	);
	const user = normalizeUser(resolveProfileUser(result));
	if (!user) throw new ForumApiError(404, { message: '用户不存在' });
	return user;
}

export async function getUserPosts(
	userId: string,
	query: ForumPostListQuery = {}
): Promise<ApiListResult<ForumPostSummary>> {
	const result = await forumRequest<RawUserPostListResult | RawUserPostRecord[]>(
		`/api/users/${userId}/posts`,
		{ query: normalizeUserPostsQuery(query) }
	);
	if (Array.isArray(result)) {
		const items = result.map(normalizeUserPost);
		return { items, total: items.length, page: query.page, pageSize: query.pageSize };
	}
	const list = result.posts || result.items || result.data || [];
	return {
		items: list.map(normalizeUserPost),
		total: result.total,
		page: query.page,
		pageSize: query.pageSize
	};
}
