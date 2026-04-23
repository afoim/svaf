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
	github_id?: number | string | null;
	githubId?: number | string | null;
	github_login?: string | null;
	githubLogin?: string | null;
	github_avatar_url?: string | null;
	githubAvatarUrl?: string | null;
	has_password?: boolean | number;
	hasPassword?: boolean | number;
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
		verified: toOptionalBoolean(user.verified ?? user.email_verified ?? user.emailVerified),
		githubId: toOptionalNumber(user.github_id ?? user.githubId) ?? null,
		githubLogin: user.github_login ?? user.githubLogin ?? null,
		githubAvatarUrl: user.github_avatar_url ?? user.githubAvatarUrl ?? null,
		hasPassword: toOptionalBoolean(user.has_password ?? user.hasPassword)
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

export type GithubOAuthMode = 'login' | 'link';

export interface GithubOAuthStartResult {
	authorize_url: string;
	state: string;
}

/**
 * 请求后端生成 GitHub 授权地址。
 * - mode=login 时无需登录态
 * - mode=link 时需要当前账号的 token，会被 forumRequest 自动带上
 */
export function startGithubOAuth(
	mode: GithubOAuthMode,
	redirect?: string
): Promise<GithubOAuthStartResult> {
	return forumRequest<GithubOAuthStartResult>('/api/auth/github/start', {
		method: 'GET',
		requiresAuth: mode === 'link',
		query: { mode, redirect }
	});
}

export function unlinkGithub(): Promise<{ success: boolean }> {
	return forumRequest<{ success: boolean }>('/api/auth/github/unlink', {
		method: 'POST',
		requiresAuth: true
	});
}

export type ForumUploadType = 'post' | 'comment' | 'avatar';

interface UploadPayload {
	file: File;
	type: ForumUploadType;
	postId?: string;
}

interface UploadResult {
	url?: string;
	path?: string;
}

export async function uploadFile({ file, type, postId }: UploadPayload): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('type', type);
	if (postId) formData.append('post_id', postId);

	const result = await forumRequest<UploadResult>('/api/upload', {
		method: 'POST',
		requiresAuth: true,
		body: formData
	});
	return result.url || result.path || '';
}

export function uploadAvatar(file: File): Promise<string> {
	return uploadFile({ file, type: 'avatar' });
}

interface ProfilePayload {
	username?: string;
	avatarUrl?: string;
	emailNotifications?: boolean;
	articleNotifications?: boolean;
}

interface RawProfileResult extends RawSessionResult {
	success?: boolean;
	message?: string;
	data?: { user?: RawSessionUser | null } | null;
}

export async function updateProfile(payload: ProfilePayload): Promise<ForumUser | null> {
	const result = await forumRequest<RawProfileResult>('/api/user/profile', {
		method: 'POST',
		requiresAuth: true,
		json: {
			username: payload.username,
			avatar_url: payload.avatarUrl,
			email_notifications: payload.emailNotifications,
			article_notifications: payload.articleNotifications
		}
	});
	const resolved = result.data?.user ?? result.user ?? resolveSessionUser(result);
	if (!resolved && (result.success !== undefined || result.message)) return null;
	return normalizeUser(resolved);
}

export async function updateMyProfile(
	payload: ForumProfilePayload
): Promise<ForumUser | null> {
	const result = await forumRequest<RawProfileResult>('/api/user/me/profile', {
		method: 'POST',
		requiresAuth: true,
		json: {
			gender: payload.gender,
			bio: payload.bio,
			age: payload.age,
			region: payload.region
		}
	});
	const resolved = result.data?.user ?? result.user ?? resolveSessionUser(result);
	if (!resolved && (result.success !== undefined || result.message)) return null;
	return normalizeUser(resolved);
}

export function changeEmail(payload: {
	newEmail: string;
	totpCode?: string;
}): Promise<{ success?: boolean; message?: string }> {
	return forumRequest<{ success?: boolean; message?: string }>('/api/user/change-email', {
		method: 'POST',
		requiresAuth: true,
		json: { new_email: payload.newEmail, totp_code: payload.totpCode }
	});
}

export async function verifyEmailChange(
	token?: string
): Promise<{ success?: boolean; message?: string; user?: ForumUser | null }> {
	const result = await forumRequest<{
		success?: boolean;
		message?: string;
		user?: RawSessionUser;
	}>('/api/verify-email-change', {
		requiresAuth: true,
		query: { token }
	});
	return {
		success: result.success,
		message: result.message,
		user: normalizeUser(result.user)
	};
}

export async function getTotpStatus(): Promise<boolean | undefined> {
	const result = await forumRequest<{ totp_enabled?: boolean | number }>(
		'/api/user/totp/status',
		{ requiresAuth: true }
	);
	return toOptionalBoolean(result.totp_enabled);
}

export async function setupTotp(): Promise<{ secret: string; uri: string }> {
	const result = await forumRequest<{ secret: string; uri?: string; otpauth_url?: string }>(
		'/api/user/totp/setup',
		{ method: 'POST', requiresAuth: true, json: {} }
	);
	return { secret: result.secret, uri: result.uri || result.otpauth_url || '' };
}

export async function verifyTotp(payload: {
	token: string;
}): Promise<{ success?: boolean; user?: ForumUser | null }> {
	const result = await forumRequest<{ success?: boolean; user?: RawSessionUser }>(
		'/api/user/totp/verify',
		{ method: 'POST', requiresAuth: true, json: payload }
	);
	return { success: result.success, user: normalizeUser(result.user) };
}

export function disableTotp(payload: {
	password: string;
	totpCode: string;
}): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>('/api/user/totp/disable', {
		method: 'POST',
		requiresAuth: true,
		json: { password: payload.password, totp_code: payload.totpCode }
	});
}

export function deleteAccount(payload: {
	password: string;
	totpCode?: string;
}): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>('/api/user/delete', {
		method: 'POST',
		requiresAuth: true,
		json: { password: payload.password, totp_code: payload.totpCode }
	});
}

export async function getCurrentUserAvatar(): Promise<string> {
	const result = await forumRequest<{ avatar_url?: string | null }>('/api/user/avatar', {
		requiresAuth: true
	});
	return result.avatar_url || '';
}
