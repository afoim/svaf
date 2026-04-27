import type {
	AdminEmailTestOptions,
	AdminEmailTestResult,
	AdminStats,
	AdminStorageGcCleanupResult,
	AdminStorageGcScanResult,
	AdminUserActionResult,
	AdminUserUpdatePayload,
	ForumAdminSettings
} from '../types/api';
import type { ForumCategory } from '../types/post';
import type { ForumUser } from '../types/user';
import { forumRequest } from './client';

interface RawAdminSettings {
	turnstile_enabled?: boolean;
	notify_on_user_delete?: boolean;
	notify_on_post_delete?: boolean;
	notify_on_username_change?: boolean;
	notify_on_avatar_change?: boolean;
	notify_on_manual_verify?: boolean;
	session_ttl_days?: number;
	draw_cooldown_seconds?: number;
}

interface RawAdminUser {
	id: string | number;
	email?: string;
	username?: string;
	display_name?: string;
	avatar_url?: string | null;
	role?: string;
	created_at?: string;
	last_seen_at?: string | null;
	verified?: number | boolean;
	totp_enabled?: number | boolean;
	draw_banned?: number | boolean;
}

interface RawCategory {
	id: string | number;
	name?: string;
	slug?: string;
	description?: string;
}

function normalizeAdminSettings(s: RawAdminSettings): ForumAdminSettings {
	return {
		turnstileEnabled: Boolean(s.turnstile_enabled),
		notifyOnUserDelete: Boolean(s.notify_on_user_delete),
		notifyOnPostDelete: Boolean(s.notify_on_post_delete),
		notifyOnUsernameChange: Boolean(s.notify_on_username_change),
		notifyOnAvatarChange: Boolean(s.notify_on_avatar_change),
		notifyOnManualVerify: Boolean(s.notify_on_manual_verify),
		sessionTtlDays: s.session_ttl_days || 7,
		drawCooldownSeconds: s.draw_cooldown_seconds || 0
	};
}

function normalizeAdminUser(u: RawAdminUser): ForumUser {
	return {
		id: String(u.id),
		email: u.email,
		username: u.username || u.email || '用户',
		displayName: u.display_name || u.username,
		avatarUrl: u.avatar_url || undefined,
		role: u.role,
		createdAt: u.created_at,
		lastSeenAt: u.last_seen_at ?? null,
		verified: u.verified !== undefined ? Boolean(u.verified) : undefined,
		totpEnabled: u.totp_enabled !== undefined ? Boolean(u.totp_enabled) : undefined,
		drawBanned: u.draw_banned !== undefined ? Boolean(u.draw_banned) : undefined
	};
}

function normalizeCategory(c: RawCategory): ForumCategory {
	return {
		id: String(c.id),
		name: c.name || '未命名分类',
		slug: c.slug,
		description: c.description
	};
}

export function getAdminStats(): Promise<AdminStats> {
	return forumRequest<AdminStats>('/api/admin/stats', { requiresAuth: true });
}

export async function getAdminSettings(): Promise<ForumAdminSettings> {
	const r = await forumRequest<RawAdminSettings>('/api/admin/settings', {
		requiresAuth: true
	});
	return normalizeAdminSettings(r);
}

export function saveAdminSettings(
	settings: ForumAdminSettings
): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>('/api/admin/settings', {
		method: 'POST',
		requiresAuth: true,
		json: {
			turnstile_enabled: settings.turnstileEnabled,
			notify_on_user_delete: settings.notifyOnUserDelete,
			notify_on_post_delete: settings.notifyOnPostDelete,
			notify_on_username_change: settings.notifyOnUsernameChange,
			notify_on_avatar_change: settings.notifyOnAvatarChange,
			notify_on_manual_verify: settings.notifyOnManualVerify,
			session_ttl_days: settings.sessionTtlDays,
			draw_cooldown_seconds: settings.drawCooldownSeconds
		}
	});
}

export async function getAdminUsers(query?: string): Promise<ForumUser[]> {
	const q = query?.trim() || undefined;
	const r = await forumRequest<RawAdminUser[]>('/api/admin/users', {
		requiresAuth: true,
		query: q ? { q } : undefined
	});
	return r.map(normalizeAdminUser);
}

export async function getAdminCategories(): Promise<ForumCategory[]> {
	const r = await forumRequest<
		RawCategory[] | { items?: RawCategory[]; categories?: RawCategory[] }
	>('/api/categories');
	const list = Array.isArray(r) ? r : r.items || r.categories || [];
	return list.map(normalizeCategory);
}

export function createAdminCategory(name: string): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>('/api/admin/categories', {
		method: 'POST',
		requiresAuth: true,
		json: { name }
	});
}

export function updateAdminCategory(
	id: string,
	name: string
): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>(`/api/admin/categories/${id}`, {
		method: 'PUT',
		requiresAuth: true,
		json: { name }
	});
}

export function deleteAdminCategory(id: string): Promise<{ success?: boolean }> {
	return forumRequest<{ success?: boolean }>(`/api/admin/categories/${id}`, {
		method: 'DELETE',
		requiresAuth: true
	});
}

function normalizeEmailTestResults(
	r:
		| { results?: AdminEmailTestResult[] }
		| AdminEmailTestResult[]
		| AdminEmailTestResult
		| null
		| undefined
): AdminEmailTestResult[] {
	if (Array.isArray(r)) return r;
	if (r && typeof r === 'object' && 'results' in r && Array.isArray(r.results))
		return r.results;
	if (r && typeof r === 'object' && 'template' in r) return [r];
	return [];
}

export async function sendAdminTestEmail(
	options: AdminEmailTestOptions
): Promise<AdminEmailTestResult[]> {
	const r = await forumRequest<
		{ results?: AdminEmailTestResult[] } | AdminEmailTestResult[] | AdminEmailTestResult
	>('/api/admin/email/test', {
		method: 'POST',
		requiresAuth: true,
		json: { to: options.to, template: options.template, payload: options.payload }
	});
	return normalizeEmailTestResults(r);
}

export function resendAdminUserVerification(
	userId: string
): Promise<AdminUserActionResult> {
	return forumRequest<AdminUserActionResult>(
		`/api/admin/users/${userId}/resend-verification`,
		{ method: 'POST', requiresAuth: true, json: {} }
	);
}

export function verifyAdminUser(userId: string): Promise<AdminUserActionResult> {
	return forumRequest<AdminUserActionResult>(`/api/admin/users/${userId}/verify`, {
		method: 'POST',
		requiresAuth: true,
		json: {}
	});
}

export function deleteAdminUser(userId: string): Promise<AdminUserActionResult> {
	return forumRequest<AdminUserActionResult>(`/api/admin/users/${userId}`, {
		method: 'DELETE',
		requiresAuth: true
	});
}

export function toggleDrawBan(userId: string): Promise<AdminUserActionResult> {
	return forumRequest<AdminUserActionResult>(`/api/admin/users/${userId}/draw-ban`, {
		method: 'POST',
		requiresAuth: true,
		json: {}
	});
}

export function deleteAdminPost(id: string): Promise<{ success: true }> {
	return forumRequest<{ success: true }>(`/api/admin/posts/${id}`, {
		method: 'DELETE',
		requiresAuth: true
	});
}

export function updateAdminUser(
	userId: string,
	payload: AdminUserUpdatePayload
): Promise<AdminUserActionResult> {
	return forumRequest<AdminUserActionResult>(`/api/admin/users/${userId}/update`, {
		method: 'POST',
		requiresAuth: true,
		json: {
			username: payload.username,
			email: payload.email,
			avatar_url: payload.avatarUrl,
			password: payload.password
		}
	});
}

export function scanAdminStorageGc(): Promise<AdminStorageGcScanResult> {
	return forumRequest<AdminStorageGcScanResult>('/api/admin/cleanup/analyze', {
		requiresAuth: true
	});
}

export function cleanupAdminStorageGc(
	orphans?: string[]
): Promise<AdminStorageGcCleanupResult> {
	return forumRequest<AdminStorageGcCleanupResult>('/api/admin/cleanup/execute', {
		method: 'POST',
		requiresAuth: true,
		json: { orphans }
	});
}

export interface SubscriptionCount {
	count: number;
}

export function getArticleNotificationsCount(): Promise<SubscriptionCount> {
	return forumRequest<SubscriptionCount>('/api/subscriptions/article-notifications');
}
