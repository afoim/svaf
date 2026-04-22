import type { ForumApiEnv } from '../types/api';
import type { Readable, Writable } from 'svelte/store';
import { readLocalStorage, writeLocalStorage } from '../utils/storage';
import { derived, get, writable } from 'svelte/store';

export const FORUM_API_ENV_STORAGE_KEY = 'forum-api-env';
export const FORUM_API_CUSTOM_BASE_URL_STORAGE_KEY = 'forum-api-custom-base-url';

export const FORUM_API_BASE_URLS: Record<ForumApiEnv, string> = {
	prod: 'https://i.2x.nz',
	dev: 'http://127.0.0.1:8787'
};

function normalizeBaseUrl(value: string) {
	return value.trim().replace(/\/+$/, '');
}

function normalizeEnv(value: ForumApiEnv | string | null | undefined): ForumApiEnv {
	return value === 'dev' ? 'dev' : 'prod';
}

function sanitizeBaseUrl(value: string | null | undefined, env: ForumApiEnv) {
	const v = normalizeBaseUrl(value || '');
	if (!v) return FORUM_API_BASE_URLS[env];
	try {
		const url = new URL(v);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return FORUM_API_BASE_URLS[env];
		}
		return normalizeBaseUrl(url.toString());
	} catch {
		return FORUM_API_BASE_URLS[env];
	}
}

interface ForumCustomBaseUrlStore {
	subscribe: Writable<string>['subscribe'];
	set(value: string): void;
	reset(env: ForumApiEnv): void;
}

interface ForumEnvStore {
	subscribe: Writable<ForumApiEnv>['subscribe'];
	baseUrl: Readable<string>;
	customBaseUrl: ForumCustomBaseUrlStore;
	set(value: ForumApiEnv): void;
	toggle(): void;
	getBaseUrl(env: ForumApiEnv): string;
}

function createEnvStore(): ForumEnvStore {
	const initialEnv = normalizeEnv(
		readLocalStorage<ForumApiEnv | string>(FORUM_API_ENV_STORAGE_KEY, 'prod')
	);
	const initialCustomBaseUrl = sanitizeBaseUrl(
		readLocalStorage<string>(
			FORUM_API_CUSTOM_BASE_URL_STORAGE_KEY,
			FORUM_API_BASE_URLS[initialEnv]
		),
		initialEnv
	);
	const envStore = writable<ForumApiEnv>(initialEnv);
	const customBaseUrlStore = writable<string>(initialCustomBaseUrl);

	customBaseUrlStore.subscribe((value) => {
		writeLocalStorage(
			FORUM_API_CUSTOM_BASE_URL_STORAGE_KEY,
			sanitizeBaseUrl(value, get(envStore))
		);
	});

	const baseUrl = derived([envStore, customBaseUrlStore], ([$env, $custom]) =>
		sanitizeBaseUrl($custom, $env)
	);

	return {
		subscribe: envStore.subscribe,
		baseUrl,
		customBaseUrl: {
			subscribe: customBaseUrlStore.subscribe,
			set: (v) => customBaseUrlStore.set(sanitizeBaseUrl(v, get(envStore))),
			reset: (env) => customBaseUrlStore.set(FORUM_API_BASE_URLS[env])
		},
		set: (v) => {
			const next = normalizeEnv(v);
			writeLocalStorage(FORUM_API_ENV_STORAGE_KEY, next);
			envStore.set(next);
			customBaseUrlStore.set(FORUM_API_BASE_URLS[next]);
		},
		toggle: () => {
			let next: ForumApiEnv = 'prod';
			envStore.update((cur) => {
				next = cur === 'prod' ? 'dev' : 'prod';
				writeLocalStorage(FORUM_API_ENV_STORAGE_KEY, next);
				return next;
			});
			customBaseUrlStore.set(FORUM_API_BASE_URLS[next]);
		},
		getBaseUrl: (env) => FORUM_API_BASE_URLS[env]
	};
}

export const forumEnv: ReturnType<typeof createEnvStore> = createEnvStore();
