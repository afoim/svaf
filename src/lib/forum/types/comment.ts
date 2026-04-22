import type { ForumUser } from './user';

export interface ForumComment {
	id: string;
	postId: string;
	parentId?: string | null;
	content: string;
	author?: ForumUser | null;
	likeCount?: number;
	liked?: boolean;
	createdAt?: string;
	updatedAt?: string;
	isPinned?: boolean;
	replies?: ForumComment[];
}

export interface ForumCommentInput {
	postId: string;
	content: string;
	parentId?: string;
	turnstileToken?: string;
}
