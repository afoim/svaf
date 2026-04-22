<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { login } from '$lib/forum/api/auth';
	import { getForumConfig } from '$lib/forum/api/config';
	import { forumAuth } from '$lib/forum/stores/auth';
	import { ForumApiError } from '$lib/forum/types/api';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	let email = $state('');
	let password = $state('');
	let totpCode = $state('');
	let loading = $state(false);
	let status = $state('');
	let turnstileEnabled = $state(false);

	async function loadConfig() {
		try {
			const config = await getForumConfig();
			turnstileEnabled = config.turnstileEnabled;
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
				totpCode: totpCode || undefined
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

	onMount(() => {
		loadConfig();
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

			{#if turnstileEnabled}
				<Alert>
					<Icon icon="mdi:shield-check-outline" />
					<AlertDescription>
						当前论坛配置已启用 Turnstile，后续可在此挂载验证码组件。
					</AlertDescription>
				</Alert>
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

			{#if status}
				<p class="text-sm text-muted-foreground">{status}</p>
			{/if}
		</CardContent>
	</Card>
</div>
