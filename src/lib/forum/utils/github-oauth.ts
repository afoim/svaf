/**
 * 后端 GitHub OAuth 流程在失败时会把错误码挂到 redirect URL 的 ?github_error= 上，
 * 这里集中翻译成对用户友好的中文提示。
 */
const ERROR_MESSAGES: Record<string, string> = {
	missing_code_or_state: 'GitHub 回调缺少必要参数，请重试。',
	invalid_state: 'GitHub 授权状态已过期或被篡改，请重试。',
	oauth_not_configured: '后端尚未配置 GitHub OAuth，请联系管理员。',
	token_exchange_failed: '与 GitHub 交换 access token 失败，请稍后重试。',
	no_access_token: 'GitHub 未返回 access token，请重试。',
	fetch_user_failed: '从 GitHub 拉取用户信息失败。',
	invalid_github_user: 'GitHub 用户信息不完整。',
	github_email_unavailable:
		'未能从 GitHub 拿到可用邮箱（可能未公开 / 未验证），请先在 GitHub 设置一个验证过的主邮箱后重试。',
	email_conflict: '该邮箱已被其他账号使用，请先用密码登录后再到个人中心绑定 GitHub。',
	github_already_linked_to_other: '该 GitHub 账号已绑定到另一个论坛账号。',
	invalid_link_state: '绑定状态无效，请重新发起绑定。',
	create_user_failed: '创建账号失败，请稍后重试。',
	login_failed: 'GitHub 登录失败。',
	internal_error: 'GitHub 登录内部错误，请稍后重试。',
	access_denied: '已取消 GitHub 授权。'
};

export function describeGithubError(code: string | null | undefined): string {
	if (!code) return 'GitHub 登录失败。';
	return ERROR_MESSAGES[code] || `GitHub 登录失败：${code}`;
}
