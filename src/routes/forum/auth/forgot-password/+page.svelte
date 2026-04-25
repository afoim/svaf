<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import TurnstileWidget from '$lib/components/TurnstileWidget.svelte';
	import { forgotPassword } from '$lib/forum/api/auth';
	import { getForumConfig } from '$lib/forum/api/config';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	let email = $state('');
	let loading = $state(false);
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

		if (turnstileEnabled && !turnstileToken) {
			emitErrorToast('找回密码', '验证码尚未加载完成或已过期，请稍后重试。');
			return;
		}
		const trimmed = email.trim();
		if (!trimmed) {
			emitErrorToast('找回密码', '请先填写邮箱。');
			return;
		}
		loading = true;
		status = '正在发送重置邮件...';
		try {
			await forgotPassword({ email: trimmed, turnstileToken: turnstileToken || undefined });
			status = '';
			emitSuccessToast(
				'找回密码',
				'如果该邮箱已注册，重置密码邮件已发送，请注意查收。'
			);
		} catch (error) {
			status = '';
			emitErrorToast(
				'找回密码',
				error instanceof Error ? error.message : '发送失败，请稍后重试。'
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
	<title>找回密码 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2 text-2xl">
				<Icon icon="mdi:email-lock-outline" class="size-6 text-primary" />
				找回密码
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground">
				填写注册时使用的邮箱，我们会向该邮箱发送一封含有重置链接的邮件。
			</p>

			<div class="space-y-2">
				<Label for="email">邮箱</Label>
				<Input
					id="email"
					type="email"
					bind:value={email}
					placeholder="you@example.com"
					autocomplete="email"
					maxlength={50}
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
						<Icon icon="mdi:email-fast-outline" class="size-4" />
					{/if}
					发送重置邮件
				</Button>
				<a
					href="/forum/auth/login/"
					class="text-sm text-primary underline decoration-dashed underline-offset-4"
				>
					返回登录
				</a>
				<a
					href="/forum/auth/reset-password/"
					class="text-sm text-primary underline decoration-dashed underline-offset-4"
				>
					已有 token？去重置
				</a>
			</div>

			{#if status}
				<p class="text-sm text-muted-foreground">{status}</p>
			{/if}
		</CardContent>
	</Card>
</div>
