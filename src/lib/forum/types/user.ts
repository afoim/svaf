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
	githubId?: number | null;
	githubLogin?: string | null;
	githubAvatarUrl?: string | null;
	hasPassword?: boolean;
	drawBanned?: boolean;
}

export interface LoginPayload {
	email: string;
	password: string;
	totpCode?: string;
	turnstileToken?: string;
}

export interface RegisterPayload {
	username: string;
	email: string;
	password: string;
	displayName?: string;
	turnstileToken?: string;
}

export interface ForgotPasswordPayload {
	email: string;
	turnstileToken?: string;
}

export interface ResetPasswordPayload {
	token: string;
	newPassword: string;
	totpCode?: string;
	turnstileToken?: string;
}
