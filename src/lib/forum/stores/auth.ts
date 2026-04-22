import type { ForumUser } from '../types/user';
import type { Writable } from 'svelte/store';
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from '../utils/storage';
import { writable } from 'svelte/store';

const TOKEN_STORAGE_KEY = 'forum-auth-token';

interface SessionResult {
	user: ForumUser | null;
	token?: string | null;
	requiresTotp?: boolean;
}

interface AuthState {
	user: ForumUser | null;
	token: string | null;
	loading: boolean;
	requiresTotp: boolean;
}

interface ForumAuthStore {
	subscribe: Writable<AuthState>['subscribe'];
	setLoading(loading: boolean): void;
	setSession(session: SessionResult): void;
	clear(): void;
	getToken(): string | null;
}

function createAuthStore(): ForumAuthStore {
	const initialToken = readLocalStorage<string | null>(TOKEN_STORAGE_KEY, null);
	const { subscribe, update, set } = writable<AuthState>({
		user: null,
		token: initialToken,
		loading: false,
		requiresTotp: false
	});

	return {
		subscribe,
		setLoading: (loading) => update((s) => ({ ...s, loading })),
		setSession: (session) => {
			if (session.token) writeLocalStorage(TOKEN_STORAGE_KEY, session.token);
			update((s) => {
				const next = session.user
					? {
							...s.user,
							...session.user,
							id: session.user.id || s.user?.id || '',
							username: session.user.username || s.user?.username || '',
							displayName:
								session.user.displayName ||
								s.user?.displayName ||
								session.user.username ||
								s.user?.username ||
								'',
							avatarUrl: session.user.avatarUrl || s.user?.avatarUrl,
							email: session.user.email || s.user?.email
						}
					: s.user;
				return {
					...s,
					user: next,
					token: session.token || s.token,
					requiresTotp: Boolean(session.requiresTotp),
					loading: false
				};
			});
		},
		clear: () => {
			removeLocalStorage(TOKEN_STORAGE_KEY);
			set({ user: null, token: null, loading: false, requiresTotp: false });
		},
		getToken: () => readLocalStorage<string | null>(TOKEN_STORAGE_KEY, null)
	};
}

export const forumAuth: ReturnType<typeof createAuthStore> = createAuthStore();
