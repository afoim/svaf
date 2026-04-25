<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import TurnstileWidget from '$lib/components/TurnstileWidget.svelte';
	import { register } from '$lib/forum/api/auth';
	import { getForumConfig } from '$lib/forum/api/config';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let status = $state('');
	let turnstileEnabled = $state(false);
	let turnstileSiteKey = $state('');
	let turnstileToken = $state('');
	let allowRegistration = $state(true);

	async function loadConfig() {
		try {
			const config = await getForumConfig();
			turnstileEnabled = config.turnstileEnabled;
			turnstileSiteKey = config.turnstileSiteKey || '';
			allowRegistration = config.allowRegistration !== false;
		} catch {
			turnstileEnabled = false;
			allowRegistration = true;
		}
	}

	function validate(): string {
		const trimmedUsername = username.trim();
		const trimmedEmail = email.trim();
		if (!allowRegistration) return '当前论坛暂未开放注册。';
		if (!trimmedUsername || !trimmedEmail || !password) return '请填写用户名、邮箱和密码。';
		if (trimmedUsername.length > 20) return '用户名最多 20 个字符。';
		if (trimmedEmail.length > 50) return '邮箱最多 50 个字符。';
		if (password.length < 8 || password.length > 16) return '密码长度需为 8-16 个字符。';
		return '';
	}

	async function submit() {
		if (loading) return;

		if (turnstileEnabled && turnstileSiteKey && !turnstileToken) {
			emitErrorToast('注册', '验证码尚未加载完成或已过期，请稍后重试。');
			return;
		}
		const message = validate();
		if (message) {
			emitErrorToast('注册', message);
			return;
		}
		loading = true;
		status = '注册中...';
		try {
			const result = await register({
				username: username.trim(),
				email: email.trim(),
				password,
				turnstileToken: turnstileToken || undefined
			});
			emitSuccessToast('注册', result.message || '注册成功，请前往邮箱完成验证。', true);
			window.location.href = '/forum/auth/login/';
		} catch (error) {
			status = '';
			emitErrorToast(
				'注册',
				error instanceof Error ? error.message : '注册失败，请稍后重试。'
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
	<title>注册 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<CardTitle class="flex items-center gap-2 text-2xl">
				<Icon icon="mdi:account-plus-outline" class="size-6 text-primary" />
				注册论坛账号
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground">
				注册后将向邮箱发送验证邮件，请使用真实邮箱以便接收通知。
			</p>

			{#if !allowRegistration}
				<Alert>
					<Icon icon="mdi:lock-outline" />
					<AlertDescription>当前论坛暂未开放注册。</AlertDescription>
				</Alert>
			{/if}

			<div class="space-y-2">
				<Label for="username">用户名（最多 20 个字符）</Label>
				<Input
					id="username"
					bind:value={username}
					placeholder="例如：acofork"
					autocomplete="username"
					maxlength={20}
					onkeydown={(e) => e.key === 'Enter' && submit()}
				/>
			</div>

			<div class="space-y-2">
				<Label for="email">邮箱（最多 50 个字符）</Label>
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

			<div class="space-y-2">
				<Label for="password">密码（8-16 个字符）</Label>
				<Input
					id="password"
					type="password"
					bind:value={password}
					placeholder="设置登录密码"
					autocomplete="new-password"
					minlength={8}
					maxlength={16}
					onkeydown={(e) => e.key === 'Enter' && submit()}
				/>
			</div>

			{#if turnstileEnabled && turnstileSiteKey}
				<div class="flex justify-center">
					<TurnstileWidget siteKey={turnstileSiteKey} onToken={(t) => turnstileToken = t} onExpired={() => turnstileToken = ""} />
				</div>
			{/if}

			<div class="flex flex-wrap items-center gap-3 pt-2">
				<Button onclick={submit} disabled={loading || !allowRegistration}>
					{#if loading}
						<Icon icon="mdi:loading" class="size-4 animate-spin" />
					{:else}
						<Icon icon="mdi:account-plus" class="size-4" />
					{/if}
					注册
				</Button>
				<a
					href="/forum/auth/login/"
					class="text-sm text-primary underline decoration-dashed underline-offset-4"
				>
					已有账号？去登录
				</a>
			</div>

			{#if status}
				<p class="text-sm text-muted-foreground">{status}</p>
			{/if}
		</CardContent>
	</Card>
</div>
