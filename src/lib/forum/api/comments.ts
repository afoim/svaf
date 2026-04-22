import type { ForumComment } from '../types/comment';
import { forumRequest } from './client';

interface RawCommentRecord {
	id: string | number;
	post_id?: string | number;
	parent_id?: string | number | null;
	author_id?: string | number;
	user_id?: string | number;
	content?: string;
	username?: string;
	avatar_url?: string | null;
	role?: string;
	like_count?: number;
	liked?: boolean;
	created_at?: string;
	updated_at?: string;
	is_pinned?: number | boolean;
}

export type CommentSortBy = 'likes' | 'time';
export type CommentSortDir = 'asc' | 'desc';

export interface CommentListQuery {
	sortBy?: CommentSortBy;
	sortDir?: CommentSortDir;
}

function normalizeComment(c: RawCommentRecord): ForumComment {
	const hasAuthor =
		c.username || c.avatar_url || c.author_id !== undefined || c.user_id !== undefined;
	return {
		id: String(c.id),
		postId: c.post_id !== undefined ? String(c.post_id) : '',
		parentId: c.parent_id !== undefined && c.parent_id !== null ? String(c.parent_id) : null,
		content: c.content || '',
		author: hasAuthor
			? {
					id:
						c.author_id !== undefined
							? String(c.author_id)
							: c.user_id !== undefined
								? String(c.user_id)
								: '',
					username: c.username || '匿名用户',
					displayName: c.username || '匿名用户',
					avatarUrl: c.avatar_url || undefined,
					role: c.role
				}
			: null,
		likeCount: c.like_count,
		liked: c.liked,
		createdAt: c.created_at,
		updatedAt: c.updated_at,
		isPinned: Boolean(c.is_pinned)
	};
}

export async function getComments(
	postId: string,
	query: CommentListQuery = {}
): Promise<ForumComment[]> {
	const result = await forumRequest<RawCommentRecord[]>(
		`/api/posts/${postId}/comments`,
		{ query: { sort_by: query.sortBy, sort_dir: query.sortDir } }
	);
	return result.map(normalizeComment);
}

/** 把扁平评论列表按 parentId 构建为树（顶层 = parentId 为空）。 */
export function buildCommentTree(flat: ForumComment[]): ForumComment[] {
	const map = new Map<string, ForumComment>();
	for (const c of flat) map.set(c.id, { ...c, replies: [] });
	const roots: ForumComment[] = [];
	for (const c of map.values()) {
		if (c.parentId && map.has(c.parentId)) {
			map.get(c.parentId)!.replies!.push(c);
		} else {
			roots.push(c);
		}
	}
	return roots;
}
