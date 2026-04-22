<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import {
		changeEmail,
		deleteAccount,
		disableTotp,
		getCurrentUser,
		logout,
		setupTotp,
		updateProfile,
		uploadAvatar,
		verifyEmailChange,
		verifyTotp
	} from '$lib/forum/api/auth';
	import { forumAuth } from '$lib/forum/stores/auth';
	import type { ForumUser } from '$lib/forum/types/user';
	import { compressAvatarImage } from '$lib/forum/utils/image-compression';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	let user = $state<ForumUser | null>(null);
	let loading = $state(true);
	let savingProfile = $state(false);
	let changingEmail = $state(false);
	let settingTotp = $state(false);
	let deletingAccount = $state(false);

	let username = $state('');
	let avatarUrl = $state('');
	let emailNotifications = $state(true);
	let articleNotifications = $state(false);

	let emailCurrent = $state('');
	let emailTotp = $state('');

	let totpSecret = $state('');
	let totpUri = $state('');
	let totpQrDataUrl = $state('');
	let totpCode = $state('');
	let disableTotpPassword = $state('');
	let disableTotpCode = $state('');

	let deletePassword = $state('');
	let deleteTotp = $state('');
	let avatarFileInput: HTMLInputElement | undefined = $state();

	function triggerAvatarUpload() {
		avatarFileInput?.click();
	}

	function applyUser(next: ForumUser | null) {
		user = next;
		username = next?.username || '';
		avatarUrl = next?.avatarUrl || '';
		emailCurrent = next?.email || '';
		emailNotifications = next?.emailNotifications ?? true;
		articleNotifications = next?.articleNotifications ?? false;
	}

	function getErrorMessage(error: unknown, fallback: string) {
		return error instanceof Error ? error.message : fallback;
	}

	function validateUsername(value: string) {
		const v = value.trim();
		if (!v) return '用户名不能为空。';
		if (v.length > 20) return '用户名不能超过 20 个字符。';
		if (/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/.test(v))
			return '用户名不能包含控制字符或不可见字符。';
		if (!/^[A-Za-z0-9_.\-\u4e00-\u9fa5]+$/.test(v))
			return '用户名只能包含中文、字母、数字、点、下划线或连字符。';
		return null;
	}

	function normalizeTotpUriTitle(uri: string) {
		try {
			const parsed = new URL(uri);
			if (parsed.protocol !== 'otpauth:') return uri;
			const accountName = parsed.pathname.startsWith('/')
				? parsed.pathname.slice(1).split(':').slice(1).join(':')
				: '';
			parsed.pathname = `/${encodeURIComponent(`AcoFork Forum${accountName ? `:${accountName}` : ''}`)}`;
			parsed.searchParams.set('issuer', 'AcoFork Forum');
			return parsed.toString();
		} catch {
			return uri;
		}
	}

	async function generateTotpQrDataUrl(uri: string): Promise<string> {
		const QRCode = await import('qrcode');
		return QRCode.toDataURL(uri, { width: 224, margin: 1, errorCorrectionLevel: 'M' });
	}

	async function refreshSession(statusMessage?: string) {
		const next = await getCurrentUser();
		forumAuth.setSession({ user: next, token: null, requiresTotp: false });
		applyUser(next);
		if (statusMessage) emitSuccessToast('个人设置', statusMessage);
		return next;
	}

	async function loadSession() {
		loading = true;
		try {
			const params = new URLSearchParams(window.location.search);
			const emailChangeToken = params.get('email_change_token') || params.get('token');
			if (emailChangeToken) {
				try {
					const r = await verifyEmailChange(emailChangeToken);
					emitSuccessToast('邮箱变更', r.message || '邮箱变更已确认。', false);
				} catch (e) {
					emitErrorToast('邮箱变更', getErrorMessage(e, '邮箱确认失败。'));
				}
				params.delete('email_change_token');
				params.delete('token');
				const qs = params.toString();
				window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
			}
			await refreshSession();
		} catch (e) {
			console.error(e);
			applyUser(null);
		} finally {
			loading = false;
		}
	}

	async function saveProfile() {
		if (!user || savingProfile) return;
		const u = username.trim();
		const a = avatarUrl.trim();
		const err = validateUsername(u);
		if (err) {
			emitErrorToast('个人设置', err);
			return;
		}
		savingProfile = true;
		try {
			await updateProfile({
				username: u,
				avatarUrl: a || '',
				emailNotifications,
				articleNotifications
			});
			avatarUrl = a;
			await refreshSession('资料已更新。');
		} catch (e) {
			emitErrorToast('个人设置', getErrorMessage(e, '资料更新失败。'));
		} finally {
			savingProfile = false;
		}
	}

	async function handleAvatarUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file || !user) return;
		try {
			let target = file;
			try {
				target = await compressAvatarImage(file);
			} catch {
				target = file;
			}
			const url = await uploadAvatar(target);
			avatarUrl = url;
			emitSuccessToast('头像设置', '头像上传成功，请记得保存资料。');
		} catch (e) {
			emitErrorToast('头像设置', getErrorMessage(e, '头像上传失败。'));
		}
	}

	async function requestEmailChange() {
		if (!user || changingEmail) return;
		changingEmail = true;
		try {
			const r = await changeEmail({
				newEmail: emailCurrent.trim(),
				totpCode: emailTotp.trim() || undefined
			});
			emailTotp = '';
			await refreshSession(r.message || '确认邮件已发送至新邮箱，请前往查收。');
		} catch (e) {
			emitErrorToast('邮箱变更', getErrorMessage(e, '邮箱变更失败。'));
		} finally {
			changingEmail = false;
		}
	}

	async function startTotpSetup() {
		if (!user || settingTotp) return;
		settingTotp = true;
		try {
			const r = await setupTotp();
			totpSecret = r.secret;
			totpUri = normalizeTotpUriTitle(r.uri);
			totpQrDataUrl = '';
			if (totpUri) {
				try {
					totpQrDataUrl = await generateTotpQrDataUrl(totpUri);
				} catch {
					emitErrorToast('双重验证（2FA）', '二维码生成失败，请改用下方密钥或 URI 手动添加。');
				}
			}
			emitSuccessToast(
				'双重验证（2FA）',
				'请使用验证器录入密钥后输入验证码完成启用。',
				false
			);
		} catch (e) {
			emitErrorToast('双重验证（2FA）', getErrorMessage(e, '2FA 初始化失败。'));
		} finally {
			settingTotp = false;
		}
	}

	async function confirmTotp() {
		if (!user || settingTotp) return;
		settingTotp = true;
		try {
			await verifyTotp({ token: totpCode.trim() });
			totpSecret = '';
			totpUri = '';
			totpQrDataUrl = '';
			totpCode = '';
			await refreshSession('2FA 已启用。');
		} catch (e) {
			emitErrorToast('双重验证（2FA）', getErrorMessage(e, '2FA 验证失败。'));
		} finally {
			settingTotp = false;
		}
	}

	async function submitDisableTotp() {
		if (!user || settingTotp) return;
		const password = disableTotpPassword;
		const code = disableTotpCode.trim();
		if (!password) {
			emitErrorToast('双重验证（2FA）', '请输入当前密码。');
			return;
		}
		if (!code) {
			emitErrorToast('双重验证（2FA）', '请输入当前 TOTP 验证码。');
			return;
		}
		settingTotp = true;
		try {
			await disableTotp({ password, totpCode: code });
			disableTotpPassword = '';
			disableTotpCode = '';
			totpSecret = '';
			totpUri = '';
			totpQrDataUrl = '';
			totpCode = '';
			await refreshSession('2FA 已关闭。');
		} catch (e) {
			emitErrorToast('双重验证（2FA）', getErrorMessage(e, '关闭 2FA 失败。'));
		} finally {
			settingTotp = false;
		}
	}

	async function submitDeleteAccount() {
		if (!user || deletingAccount) return;
		if (typeof window !== 'undefined' && !window.confirm('确定要注销账号吗？此操作无法撤销。'))
			return;
		deletingAccount = true;
		try {
			await deleteAccount({
				password: deletePassword,
				totpCode: deleteTotp.trim() || undefined
			});
			forumAuth.clear();
			window.location.href = '/forum/';
		} catch (e) {
			emitErrorToast('账号安全', getErrorMessage(e, '账号注销失败。'));
		} finally {
			deletingAccount = false;
		}
	}

	async function submitLogout() {
		try {
			await logout();
		} catch {
			// ignore
		}
		forumAuth.clear();
		window.location.href = '/forum/auth/login/';
	}

	let isAdmin = $derived(user?.role === 'admin');

	onMount(() => {
		void loadSession();
	});
</script>

<svelte:head>
	<title>个人中心 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-5xl px-4 py-12 space-y-5">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:account-circle-outline" class="size-6 text-primary" />
					个人中心
				</CardTitle>
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" href="/forum/">
						<Icon icon="mdi:arrow-left" class="size-4" />
						返回论坛
					</Button>
					{#if user?.id}
						<Button variant="outline" href={`/forum/u/?id=${encodeURIComponent(user.id)}`}>
							<Icon icon="mdi:account" class="size-4" />
							公开主页
						</Button>
					{/if}
					{#if isAdmin}
						<Button variant="outline" href="/forum/admin/">
							<Icon icon="mdi:shield-crown-outline" class="size-4" />
							管理控制台
						</Button>
					{/if}
					{#if user}
						<Button variant="outline" onclick={submitLogout}>
							<Icon icon="mdi:logout" class="size-4" />
							退出登录
						</Button>
					{/if}
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground">集中管理论坛资料、邮箱、2FA 与账号安全。</p>

			{#if loading}
				<div class="space-y-2">
					<div class="h-4 w-1/3 rounded bg-muted"></div>
					<div class="h-32 rounded bg-muted/70"></div>
					<div class="h-32 rounded bg-muted/70"></div>
				</div>
			{:else if !user}
				<Alert>
					<Icon icon="mdi:information-outline" />
					<AlertDescription class="flex flex-wrap items-center gap-2">
						<span>当前尚未登录，无法查看论坛个人资料。</span>
						<a
							href="/forum/auth/login/"
							class="text-primary underline decoration-dashed underline-offset-4"
						>
							前往登录
						</a>
					</AlertDescription>
				</Alert>
			{:else}
				<input
					bind:this={avatarFileInput}
					type="file"
					accept="image/*"
					class="hidden"
					onchange={handleAvatarUpload}
				/>

				<div class="grid gap-5 lg:grid-cols-2">
					<!-- 基础资料 -->
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">基础资料</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
								<button
									type="button"
									class="group relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted text-muted-foreground"
									onclick={triggerAvatarUpload}
									title="点击上传新头像"
								>
									{#if avatarUrl}
										<img
											src={avatarUrl}
											alt="当前头像"
											class="size-full object-cover transition group-hover:scale-105"
											loading="lazy"
											referrerpolicy="no-referrer"
										/>
									{:else}
										<div class="flex size-full items-center justify-center">
											<Icon icon="mdi:account" class="size-10" />
										</div>
									{/if}
									<div
										class="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
									>
										点击上传
									</div>
								</button>
								<div class="min-w-0 flex-1 space-y-2">
									<Label for="avatar-url">头像 URL</Label>
									<Input id="avatar-url" bind:value={avatarUrl} placeholder="https://..." />
									<p class="text-xs text-muted-foreground">留空表示使用默认头像。</p>
								</div>
							</div>

							<div class="space-y-2">
								<Label for="username">用户名</Label>
								<Input id="username" bind:value={username} maxlength={20} />
							</div>

							<div class="flex items-center justify-between gap-3 rounded-md border p-3">
								<Label for="notify-email" class="m-0 flex-1 cursor-pointer">
									接收论坛邮件通知
								</Label>
								<Switch id="notify-email" bind:checked={emailNotifications} />
							</div>
							<div class="flex items-center justify-between gap-3 rounded-md border p-3">
								<Label for="notify-article" class="m-0 flex-1 cursor-pointer">
									接收博客文章推送通知
								</Label>
								<Switch id="notify-article" bind:checked={articleNotifications} />
							</div>

							<Button onclick={saveProfile} disabled={savingProfile}>
								{#if savingProfile}
									<Icon icon="mdi:loading" class="size-4 animate-spin" />
								{:else}
									<Icon icon="mdi:content-save-outline" class="size-4" />
								{/if}
								保存资料
							</Button>
						</CardContent>
					</Card>

					<!-- 邮箱变更 -->
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">邮箱变更</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<p class="text-sm text-muted-foreground">
								提交后，确认链接会发送到填写的邮箱地址。
							</p>
							<div class="space-y-2">
								<Label for="email-current">新邮箱地址</Label>
								<Input id="email-current" type="email" bind:value={emailCurrent} />
							</div>
							<div class="space-y-2">
								<Label for="email-totp">TOTP 验证码（如已启用）</Label>
								<Input
									id="email-totp"
									bind:value={emailTotp}
									inputmode="numeric"
									maxlength={6}
								/>
							</div>
							<Button variant="outline" onclick={requestEmailChange} disabled={changingEmail}>
								{#if changingEmail}
									<Icon icon="mdi:loading" class="size-4 animate-spin" />
								{:else}
									<Icon icon="mdi:email-arrow-right-outline" class="size-4" />
								{/if}
								发送确认邮件
							</Button>
						</CardContent>
					</Card>

					<!-- 2FA -->
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">双重验证（2FA / TOTP）</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							{#if user.totpEnabled}
								<Alert>
									<Icon icon="mdi:shield-check-outline" />
									<AlertDescription>当前账号已启用 2FA。</AlertDescription>
								</Alert>
								<div class="space-y-3 rounded-md border p-4">
									<p class="text-sm text-muted-foreground">
										关闭 2FA 需要同时验证当前密码和当前 TOTP 验证码。
									</p>
									<div class="space-y-2">
										<Label for="disable-pwd">当前密码</Label>
										<Input id="disable-pwd" type="password" bind:value={disableTotpPassword} />
									</div>
									<div class="space-y-2">
										<Label for="disable-code">当前 TOTP 验证码</Label>
										<Input
											id="disable-code"
											bind:value={disableTotpCode}
											inputmode="numeric"
											maxlength={6}
											placeholder="输入 6 位验证码"
										/>
									</div>
									<Button variant="destructive" onclick={submitDisableTotp} disabled={settingTotp}>
										{#if settingTotp}
											<Icon icon="mdi:loading" class="size-4 animate-spin" />
										{:else}
											<Icon icon="mdi:shield-off-outline" class="size-4" />
										{/if}
										关闭 2FA
									</Button>
								</div>
							{:else}
								<p class="text-sm text-muted-foreground">
									启用 2FA 后，登录与敏感操作将可使用动态验证码保护。
								</p>
								<Button variant="outline" onclick={startTotpSetup} disabled={settingTotp}>
									{#if settingTotp}
										<Icon icon="mdi:loading" class="size-4 animate-spin" />
									{:else}
										<Icon icon="mdi:shield-plus-outline" class="size-4" />
									{/if}
									开始启用 2FA
								</Button>
								{#if totpSecret}
									<div class="space-y-3 rounded-md border p-4">
										<p class="text-sm text-muted-foreground">
											请使用验证器扫描二维码，或手动录入下方密钥 / otpauth URI。
										</p>
										{#if totpQrDataUrl}
											<div class="flex justify-center">
												<div class="rounded-md bg-white p-3 shadow-sm">
													<img
														src={totpQrDataUrl}
														alt="2FA 二维码"
														class="size-56 rounded object-contain"
														loading="lazy"
													/>
												</div>
											</div>
										{/if}
										<div>
											<div class="text-xs uppercase tracking-wide text-muted-foreground">
												Secret
											</div>
											<div
												class="mt-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm"
											>
												{totpSecret}
											</div>
										</div>
										{#if totpUri}
											<div>
												<div class="text-xs uppercase tracking-wide text-muted-foreground">
													URI
												</div>
												<div
													class="mt-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-xs"
												>
													{totpUri}
												</div>
											</div>
										{/if}
										<Input
											bind:value={totpCode}
											inputmode="numeric"
											maxlength={6}
											placeholder="输入 6 位验证码"
										/>
										<Button onclick={confirmTotp} disabled={settingTotp}>
											{#if settingTotp}
												<Icon icon="mdi:loading" class="size-4 animate-spin" />
											{:else}
												<Icon icon="mdi:check" class="size-4" />
											{/if}
											验证并启用
										</Button>
									</div>
								{/if}
							{/if}
						</CardContent>
					</Card>

					<!-- 危险区域 -->
					<Card class="border-destructive/40">
						<CardHeader>
							<CardTitle class="text-lg text-destructive">危险区域</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<p class="text-sm text-muted-foreground">
								注销账号后，当前论坛账号数据无法恢复。
							</p>
							<div class="space-y-2">
								<Label for="del-pwd">当前密码</Label>
								<Input id="del-pwd" type="password" bind:value={deletePassword} />
							</div>
							<div class="space-y-2">
								<Label for="del-totp">TOTP 验证码（如已启用）</Label>
								<Input
									id="del-totp"
									bind:value={deleteTotp}
									inputmode="numeric"
									maxlength={6}
								/>
							</div>
							<Button
								variant="destructive"
								onclick={submitDeleteAccount}
								disabled={deletingAccount}
							>
								{#if deletingAccount}
									<Icon icon="mdi:loading" class="size-4 animate-spin" />
								{:else}
									<Icon icon="mdi:account-remove-outline" class="size-4" />
								{/if}
								注销账号
							</Button>
						</CardContent>
					</Card>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
