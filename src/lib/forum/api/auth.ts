import type { RegisterResult, SessionResult } from '../types/api';
import type {
	ForgotPasswordPayload,
	ForumUser,
	ForumUserGender,
	LoginPayload,
	RegisterPayload,
	ResetPasswordPayload
} from '../types/user';
import { forumRequest } from './client';

export interface ForumProfilePayload {
	gender?: ForumUserGender | null;
	bio?: string | null;
	age?: number | null;
	region?: string | null;
}

interface RawSessionUser {
	id: string | number;
	email?: string;
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
	isAdmin?: boolean | number;
	created_at?: string;
	createdAt?: string;
	email_notifications?: boolean;
	emailNotifications?: boolean;
	article_notifications?: boolean;
	articleNotifications?: boolean;
	totp_enabled?: boolean | number;
	totpEnabled?: boolean | number;
	two_factor_enabled?: boolean | number;
	mfa_enabled?: boolean | number;
	verified?: number | boolean;
	email_verified?: number | boolean;
	emailVerified?: boolean | number;
}

interface RawSessionResult {
	token?: string | null;
	error?: string;
	user?: RawSessionUser | null;
	id?: string | number;
	email?: string;
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
	isAdmin?: boolean | number;
	created_at?: string;
	createdAt?: string;
	email_notifications?: boolean;
	emailNotifications?: boolean;
	article_notifications?: boolean;
	articleNotifications?: boolean;
	totp_enabled?: boolean | number;
	totpEnabled?: boolean | number;
	two_factor_enabled?: boolean | number;
	mfa_enabled?: boolean | number;
	verified?: number | boolean;
	email_verified?: number | boolean;
	emailVerified?: boolean | number;
}

function normalizeRole(user?: RawSessionUser | null) {
	if (!user) return undefined;
	if (user.is_admin === true || user.is_admin === 1) return 'admin';
	const rawRole = user.role;
	if (typeof rawRole === 'number') return rawRole === 1 ? 'admin' : String(rawRole);
	if (typeof rawRole === 'string') {
		const n = rawRole.trim().toLowerCase();
		if (['admin', 'administrator', 'root', 'superadmin', 'super_admin'].includes(n))
			return 'admin';
		return n;
	}
	return undefined;
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
		const parsed = Number(n);
		return Number.isFinite(parsed) ? parsed : undefined;
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

function normalizeUser(user?: RawSessionUser | null): ForumUser | null {
	if (!user) return null;
	return {
		id: String(user.id),
		email: user.email,
		username: user.username || user.email || '用户',
		displayName: user.display_name || user.displayName || user.username,
		avatarUrl: user.avatar_url || user.avatarUrl || undefined,
		bio: user.bio?.trim() || undefined,
		gender: normalizeGender(user.gender),
		age: toOptionalNumber(user.age),
		region: user.region?.trim() || undefined,
		role: normalizeRole(user),
		createdAt: user.created_at || user.createdAt,
		emailNotifications: user.email_notifications ?? user.emailNotifications,
		articleNotifications: user.article_notifications ?? user.articleNotifications,
		totpEnabled: toOptionalBoolean(
			user.totp_enabled ?? user.totpEnabled ?? user.two_factor_enabled ?? user.mfa_enabled
		),
		verified: toOptionalBoolean(user.verified ?? user.email_verified ?? user.emailVerified)
	};
}

function resolveSessionUser(result: RawSessionResult) {
	if (result.user) return result.user;
	if (result.id !== undefined || result.email || result.username) {
		return {
			id: result.id || '',
			email: result.email,
			username: result.username,
			display_name: result.display_name,
			displayName: result.displayName,
			avatar_url: result.avatar_url,
			bio: result.bio,
			gender: result.gender,
			age: result.age,
			region: result.region,
			avatarUrl: result.avatarUrl,
			role: result.role,
			is_admin: result.is_admin,
			isAdmin: result.isAdmin,
			created_at: result.created_at,
			createdAt: result.createdAt,
			email_notifications: result.email_notifications,
			emailNotifications: result.emailNotifications,
			article_notifications: result.article_notifications,
			articleNotifications: result.articleNotifications,
			totp_enabled: result.totp_enabled,
			totpEnabled: result.totpEnabled,
			two_factor_enabled: result.two_factor_enabled,
			mfa_enabled: result.mfa_enabled,
			verified: result.verified,
			email_verified: result.email_verified,
			emailVerified: result.emailVerified
		} satisfies RawSessionUser;
	}
	return null;
}

function normalizeSession(result: RawSessionResult): SessionResult {
	return {
		token: result.token ?? null,
		requiresTotp: result.error === 'TOTP_REQUIRED',
		user: normalizeUser(resolveSessionUser(result))
	};
}

export async function login(payload: LoginPayload): Promise<SessionResult> {
	const result = await forumRequest<RawSessionResult>('/api/login', {
		method: 'POST',
		json: {
			email: payload.email,
			password: payload.password,
			totp_code: payload.totpCode,
			'cf-turnstile-response': payload.turnstileToken
		}
	});
	return normalizeSession(result);
}

export async function register(payload: RegisterPayload): Promise<RegisterResult> {
	const result = await forumRequest<RegisterResult>('/api/register', {
		method: 'POST',
		json: {
			username: payload.username,
			email: payload.email,
			password: payload.password,
			'cf-turnstile-response': payload.turnstileToken
		}
	});
	return {
		success: Boolean(result.success),
		message: result.message || '注册成功，请前往邮箱完成验证。'
	} satisfies RegisterResult;
}

export async function getSession(): Promise<SessionResult> {
	const result = await forumRequest<RawSessionResult>('/api/session', {
		requiresAuth: true
	});
	return normalizeSession(result);
}

export async function getCurrentUser(): Promise<ForumUser | null> {
	const result = await forumRequest<RawSessionUser>('/api/user/me', {
		requiresAuth: true
	});
	return normalizeUser(result);
}

export function forgotPassword(
	payload: ForgotPasswordPayload
): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>('/api/auth/forgot-password', {
		method: 'POST',
		json: {
			email: payload.email,
			'cf-turnstile-response': payload.turnstileToken
		}
	});
}

export function resetPassword(
	payload: ResetPasswordPayload
): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>('/api/auth/reset-password', {
		method: 'POST',
		json: {
			token: payload.token,
			new_password: payload.newPassword,
			totp_code: payload.totpCode,
			'cf-turnstile-response': payload.turnstileToken
		}
	});
}

export function logout(): Promise<{ success: boolean }> {
	return forumRequest<{ success: boolean }>('/api/logout', {
		method: 'POST',
		requiresAuth: true
	});
}
