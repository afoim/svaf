import { forumAuth } from '../stores/auth';
import { forumEnv } from '../stores/env';
import { ForumApiError, type ForumApiErrorPayload } from '../types/api';
import { createSecurityHeaders } from '../utils/security';
import { get } from 'svelte/store';

export interface ForumRequestOptions extends RequestInit {
	requiresAuth?: boolean;
	query?: Record<string, string | number | boolean | undefined | null>;
	json?: unknown;
}

function buildUrl(
	path: string,
	query?: ForumRequestOptions['query'],
	baseUrl = get(forumEnv.baseUrl)
): string {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const url = new URL(normalizedPath, baseUrl);
	for (const [k, v] of Object.entries(query || {})) {
		if (v === undefined || v === null || v === '') continue;
		url.searchParams.set(k, String(v));
	}
	return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
	const contentType = response.headers.get('content-type') || '';
	const isJson = contentType.includes('application/json');
	const body = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		const payload = (
			typeof body === 'object' && body
				? body
				: { message: typeof body === 'string' ? body : undefined }
		) as ForumApiErrorPayload;
		throw new ForumApiError(response.status, payload);
	}
	return body as T;
}

export async function forumRequest<T>(
	path: string,
	options: ForumRequestOptions = {}
): Promise<T> {
	const headers = new Headers(options.headers);
	const method = (options.method || 'GET').toUpperCase();
	const token = forumAuth.getToken();
	const currentEnv = get(forumEnv);
	const baseUrl = get(forumEnv.baseUrl);
	const defaultBaseUrl = forumEnv.getBaseUrl(currentEnv);

	if (options.requiresAuth && !token) {
		throw new ForumApiError(401, {
			message: `当前站点 ${typeof window !== 'undefined' ? window.location.origin : ''} 下未检测到论坛登录令牌，请先在当前域名重新登录。目标论坛接口：${baseUrl}`,
			code: 'FORUM_AUTH_TOKEN_MISSING'
		});
	}

	if (options.json !== undefined) headers.set('Content-Type', 'application/json');

	if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
		for (const [k, v] of Object.entries(createSecurityHeaders())) headers.set(k, v);
	}

	if (options.requiresAuth && token) headers.set('Authorization', `Bearer ${token}`);
	else if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);

	const requestInit: RequestInit = {
		...options,
		method,
		headers,
		body: options.json !== undefined ? JSON.stringify(options.json) : options.body
	};

	let response: Response;
	try {
		response = await fetch(buildUrl(path, options.query, baseUrl), requestInit);
	} catch (error) {
		if (method === 'GET' && baseUrl !== defaultBaseUrl) {
			try {
				response = await fetch(buildUrl(path, options.query, defaultBaseUrl), requestInit);
				forumEnv.customBaseUrl.reset(currentEnv);
				return parseResponse<T>(response);
			} catch {
				// fall through
			}
		}
		throw new ForumApiError(503, {
			code: 'FORUM_API_UNREACHABLE',
			message:
				error instanceof Error
					? `论坛接口不可访问：${error.message}`
					: '论坛接口不可访问，请检查环境地址配置。'
		});
	}

	return parseResponse<T>(response);
}
