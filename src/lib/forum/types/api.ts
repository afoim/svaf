export type ForumApiEnv = 'prod' | 'dev';

export interface ForumApiErrorPayload {
	code?: string;
	message?: string;
	error?: string;
	details?: unknown;
}

export class ForumApiError extends Error {
	status: number;
	code?: string;
	details?: unknown;

	constructor(status: number, payload: ForumApiErrorPayload = {}) {
		super(payload.message || payload.error || `论坛请求失败（${status}）`);
		this.name = 'ForumApiError';
		this.status = status;
		this.code = payload.code;
		this.details = payload.details;
	}
}

export interface ApiListResult<T> {
	items: T[];
	total?: number;
	page?: number;
	pageSize?: number;
}

export interface SessionResult {
	user: import('./user').ForumUser | null;
	token?: string | null;
	requiresTotp?: boolean;
}

export interface RegisterResult {
	success?: boolean;
	message?: string;
}

export interface ForumConfig {
	turnstileEnabled: boolean;
	turnstileSiteKey?: string;
	allowRegistration?: boolean;
	userCount?: number;
}

export interface AdminStats {
	users: number;
	posts: number;
	comments: number;
}

export interface ForumAdminSettings {
	turnstileEnabled: boolean;
	notifyOnUserDelete: boolean;
	notifyOnPostDelete: boolean;
	notifyOnUsernameChange: boolean;
	notifyOnAvatarChange: boolean;
	notifyOnManualVerify: boolean;
	sessionTtlDays: number;
}

export interface AdminEmailTestResult {
	template: string;
	label?: string;
	success: boolean;
	error?: string;
}

export interface AdminEmailTestOptions {
	to: string;
	template?: string;
	payload?: Record<string, string>;
}

export interface AdminUserActionResult {
	success?: boolean;
	message?: string;
	user?: import('./user').ForumUser | null;
}

export interface AdminUserUpdatePayload {
	username?: string;
	email?: string;
	avatarUrl?: string;
	password?: string;
}

export interface AdminStorageGcScanResult {
	total_files?: number;
	used_files?: number;
	orphaned_files?: number;
	orphans?: string[];
}

export interface AdminStorageGcCleanupResult {
	success?: boolean;
	message?: string;
}
