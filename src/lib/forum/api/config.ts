import type { ForumConfig } from '../types/api';
import { forumRequest } from './client';

interface RawForumConfig {
	turnstile_enabled?: boolean;
	turnstile_site_key?: string;
	allow_registration?: boolean;
	user_count?: number;
}

export async function getForumConfig(): Promise<ForumConfig> {
	const result = await forumRequest<RawForumConfig>('/api/config');
	return {
		turnstileEnabled: Boolean(result.turnstile_enabled),
		turnstileSiteKey: result.turnstile_site_key,
		allowRegistration: result.allow_registration,
		userCount: result.user_count
	} satisfies ForumConfig;
}
