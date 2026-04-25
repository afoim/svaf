<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import TurnstileWidget from '$lib/components/TurnstileWidget.svelte';
	import { resetPassword } from '$lib/forum/api/auth';
	import { getForumConfig } from '$lib/forum/api/config';
	import { ForumApiError } from '$lib/forum/types/api';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	let token = $state('');
	let newPassword = $state('');
	let totpCode = $state('');
	let loading = $state(false);
	let status = $state('');
	let turnstileEnabled = $state(false);
	let turnstileSiteKey = $state('');
	let turnstileToken = $state('');

	function readTokenFromUrl(): string {
		if (typeof window === 'undefined') return '';
		return new URLSearchParams(window.location.search).get('token') ?? '';
	}

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

		if (turnstileEnabled && !turnstileToken) {
			emitErrorToast('重置密码', '验证码尚未加载完成或已过期，请稍后重试。');
			return;
		}
		const trimmedToken = token.trim();
		if (!trimmedToken) {
			emitErrorToast('重置密码', '缺少重置 token。');
			return;
		}
		if (newPassword.length < 8 || newPassword.length > 16) {
			emitErrorToast('重置密码', '新密码长度需为 8-16 个字符。');
			return;
		}
		loading = true;
		status = '正在重置密码...';
		try {
			await resetPassword({
				token: trimmedToken,
				newPassword,
				totpCode: totpCode.trim() || undefined,
				turnstileToken: turnstileToken || undefined
			});
			emitSuccessToast('重置密码', '密码已重置，正在前往登录页...');
			window.location.href = '/forum/auth/login/';
		} catch (error) {
			status = '';
			if (error instanceof ForumApiError && error.message === 'TOTP_REQUIRED') {
				emitErrorToast('重置密码', '该账号已开启二步验证，请填写 TOTP 验证码后重试。');
				return;
			}
			emitErrorToast(
				'重置密码',
				error instanceof Error ? error.message : '重置失败，请稍后重试。'
			);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		token = readTokenFromUrl();
		loadConfig();
	});
</script>

<svelte:head>
	<title>重置密码 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2 text-2xl">
				<Icon icon="mdi:key-variant" class="size-6 text-primary" />
				重置密码
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground">
				从邮件中复制 token 粘贴到下方，并设置新密码。如果通过邮件链接进入，token 已自动填入。
			</p>

			<div class="space-y-2">
				<Label for="token">重置 token</Label>
				<Input
					id="token"
					bind:value={token}
					placeholder="粘贴邮件中的 token"
					autocomplete="off"
				/>
			</div>

			<div class="space-y-2">
				<Label for="new-password">新密码（8-16 个字符）</Label>
				<Input
					id="new-password"
					type="password"
					bind:value={newPassword}
					placeholder="输入新密码"
					autocomplete="new-password"
					minlength={8}
					maxlength={16}
					onkeydown={(e) => e.key === 'Enter' && submit()}
				/>
			</div>

			<div class="space-y-2">
				<Label for="totp">TOTP 验证码（如需要）</Label>
				<Input
					id="totp"
					bind:value={totpCode}
					placeholder="账号开启 2FA 时填写"
					autocomplete="one-time-code"
					inputmode="numeric"
					onkeydown={(e) => e.key === 'Enter' && submit()}
				/>
			</div>

			{#if turnstileEnabled && turnstileSiteKey}
				<div class="flex justify-center">
					<TurnstileWidget siteKey={turnstileSiteKey} onToken={(t) => turnstileToken = t} onExpired={() => turnstileToken = ""} />
				</div>
			{/if}

			{#if turnstileEnabled && !turnstileSiteKey}
				<Alert>
					<Icon icon="mdi:shield-off-outline" />
					<AlertDescription>论坛已启用 Turnstile 但未配置站点密钥，请联系管理员。</AlertDescription>
				</Alert>
			{/if}

			<div class="flex flex-wrap items-center gap-3 pt-2">
				<Button onclick={submit} disabled={loading}>
					{#if loading}
						<Icon icon="mdi:loading" class="size-4 animate-spin" />
					{:else}
						<Icon icon="mdi:check" class="size-4" />
					{/if}
					重置密码
				</Button>
				<a
					href="/forum/auth/login/"
					class="text-sm text-primary underline decoration-dashed underline-offset-4"
				>
					返回登录
				</a>
				<a
					href="/forum/auth/forgot-password/"
					class="text-sm text-primary underline decoration-dashed underline-offset-4"
				>
					重新申请邮件
				</a>
			</div>

			{#if status}
				<p class="text-sm text-muted-foreground">{status}</p>
			{/if}
		</CardContent>
	</Card>
</div>
