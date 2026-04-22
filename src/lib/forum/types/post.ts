import type { ForumUser } from './user';

export interface ForumCategory {
	id: string;
	name: string;
	slug?: string;
	description?: string;
}

export interface ForumPostSummary {
	id: string;
	authorId?: string;
	title: string;
	slug?: string;
	excerpt?: string;
	content?: string;
	coverImageUrl?: string;
	categoryId?: string;
	category?: ForumCategory | null;
	author?: ForumUser | null;
	viewCount?: number;
	commentCount?: number;
	likeCount?: number;
	liked?: boolean;
	isPinned?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface ForumPostDetail extends ForumPostSummary {
	rendered?: { html: string };
}

export interface ForumPostInput {
	title: string;
	content: string;
	categoryId?: string;
	excerpt?: string;
}
