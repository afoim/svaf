export type ForumUserGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface ForumUser {
	id: string;
	username: string;
	displayName?: string;
	avatarUrl?: string;
	bio?: string;
	gender?: ForumUserGender;
	age?: number;
	region?: string;
	email?: string;
	role?: string;
	createdAt?: string;
	lastSeenAt?: string | null;
	emailNotifications?: boolean;
	articleNotifications?: boolean;
	totpEnabled?: boolean;
	verified?: boolean;
}
