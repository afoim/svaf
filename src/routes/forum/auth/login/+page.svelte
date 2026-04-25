<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { getCurrentUser, login, startGithubOAuth } from '$lib/forum/api/auth';
	import { getForumConfig } from '$lib/forum/api/config';
	import { forumAuth } from '$lib/forum/stores/auth';
	import { ForumApiError } from '$lib/forum/types/api';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';
	import { describeGithubError } from '$lib/forum/utils/github-oauth';
	import TurnstileWidget from '$lib/components/TurnstileWidget.svelte';

	let email = $state('');
	let password = $state('');
	let totpCode = $state('');
	let loading = $state(false);
	let githubLoading = $state(false);
	let status = $state('');
	let turnstileEnabled = $state(false);
	let turnstileSiteKey = $state('');
	let turnstileToken = $state('');

	async function loadConfig() {
		try {
			const config = await getForumConfig();
			turnstileEnabled = config.turnstileEnabled;
			turnstileSiteKey = config.turnstileSiteKey || '';
		} catch {
			turnstileEnabled = false;
		}
	}

	async function submit() {
		if (loading) return;
		loading = true;
		status = '登录中...';
		try {
			const session = await login({
				email,
				password,
				totpCode: totpCode || undefined,
				turnstileToken: turnstileToken || undefined
			});
			forumAuth.setSession(session);
			if (session.requiresTotp) {
				status = '';
				emitErrorToast('登录', '检测到需要二步验证，请填写 TOTP 验证码后重试。');
				return;
			}
			emitSuccessToast('登录', '登录成功，正在跳转...', true);
			window.location.href = '/forum/';
		} catch (error) {
			status = '';
			if (error instanceof ForumApiError && error.message === 'TOTP_REQUIRED') {
				emitErrorToast('登录', '检测到需要二步验证，请填写 TOTP 验证码后重试。');
				return;
			}
			emitErrorToast(
				'登录',
				error instanceof Error ? error.message : '登录失败，请稍后再试。'
			);
		} finally {
			loading = false;
		}
	}

	async function loginWithGithub() {
		if (githubLoading) return;
		githubLoading = true;
		try {
			const redirect = `${window.location.origin}/forum/auth/login/`;
			const { authorize_url } = await startGithubOAuth('login', redirect);
			window.location.assign(authorize_url);
		} catch (error) {
			githubLoading = false;
			emitErrorToast(
				'GitHub 登录',
				error instanceof Error ? error.message : 'GitHub 登录初始化失败。'
			);
		}
	}

	/**
	 * 后端 GitHub callback 成功时通过 URL fragment 传 token 回来：
	 *   /forum/auth/login/#token=xxx&new=0|1
	 * 失败时通过 query 传错误码：
	 *   /forum/auth/login/?github_error=xxx
	 */
	async function consumeGithubCallback() {
		if (typeof window === 'undefined') return;

		const url = new URL(window.location.href);
		const errorCode = url.searchParams.get('github_error');
		if (errorCode) {
			url.searchParams.delete('github_error');
			window.history.replaceState({}, '', url.pathname + url.search + url.hash);
			emitErrorToast('GitHub 登录', describeGithubError(errorCode));
			return;
		}

		const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
		if (!hash) return;
		const params = new URLSearchParams(hash);
		const token = params.get('token');
		if (!token) return;

		const isNew = params.get('new') === '1';
		// 立刻清掉 fragment，避免 token 留在 URL
		window.history.replaceState({}, '', url.pathname + url.search);

		try {
			forumAuth.setSession({ user: null, token, requiresTotp: false });
			const me = await getCurrentUser();
			forumAuth.setSession({ user: me, token, requiresTotp: false });
			emitSuccessToast('GitHub 登录', isNew ? '注册并登录成功，正在跳转...' : '登录成功，正在跳转...', true);
			window.location.href = '/forum/';
		} catch (error) {
			forumAuth.clear();
			emitErrorToast(
				'GitHub 登录',
				error instanceof Error ? error.message : '获取用户信息失败，请重试。'
			);
		}
	}

	onMount(() => {
		loadConfig();
		void consumeGithubCallback();
	});
</script>

<svelte:head>
	<title>登录 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2 text-2xl">
				<Icon icon="mdi:login" class="size-6 text-primary" />
				登录论坛
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground">
				当前后端使用邮箱 + 密码登录，已兼容 TOTP_REQUIRED 分支。
			</p>

			<div class="space-y-2">
				<Label for="email">邮箱</Label>
				<Input
					id="email"
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					autocomplete="email"
					onkeydown={(e) => e.key === 'Enter' && submit()}
				/>
			</div>

			<div class="space-y-2">
				<Label for="password">密码</Label>
				<Input
					id="password"
					type="password"
					bind:value={password}
					placeholder="请输入密码"
					autocomplete="current-password"
					onkeydown={(e) => e.key === 'Enter' && submit()}
				/>
			</div>

			<div class="space-y-2">
				<Label for="totp">TOTP 验证码（如需要）</Label>
				<Input
					id="totp"
					bind:value={totpCode}
					placeholder="6 位动态验证码"
					autocomplete="one-time-code"
					inputmode="numeric"
					onkeydown={(e) => e.key === 'Enter' && submit()}
				/>
			</div>

			{#if turnstileEnabled && turnstileSiteKey}
				<div class="flex justify-center">
					<TurnstileWidget siteKey={turnstileSiteKey} onToken={(t) => turnstileToken = t} />
				</div>
			{/if}

			<div class="flex flex-wrap items-center gap-3 pt-2">
				<Button onclick={submit} disabled={loading}>
					{#if loading}
						<Icon icon="mdi:loading" class="size-4 animate-spin" />
					{:else}
						<Icon icon="mdi:login" class="size-4" />
					{/if}
					登录
				</Button>
				<Button variant="outline" href="/forum/">
					<Icon icon="mdi:arrow-left" class="size-4" />
					返回论坛
				</Button>
				<a
					href="/forum/auth/forgot-password/"
					class="text-sm text-primary underline decoration-dashed underline-offset-4"
				>
					忘记密码？
				</a>
				<a
					href="/forum/auth/register/"
					class="text-sm text-primary underline decoration-dashed underline-offset-4"
				>
					没有账号？去注册
				</a>
			</div>

			<div class="relative my-2">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card px-2 text-muted-foreground">或使用第三方账号</span>
				</div>
			</div>

			<Button
				variant="outline"
				class="w-full"
				onclick={loginWithGithub}
				disabled={githubLoading}
			>
				{#if githubLoading}
					<Icon icon="mdi:loading" class="size-4 animate-spin" />
				{:else}
					<Icon icon="mdi:github" class="size-4" />
				{/if}
				使用 GitHub 登录
			</Button>

			{#if status}
				<p class="text-sm text-muted-foreground">{status}</p>
			{/if}
		</CardContent>
	</Card>
</div>
