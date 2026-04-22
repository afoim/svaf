<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import {
		cleanupAdminStorageGc,
		createAdminCategory,
		deleteAdminCategory,
		deleteAdminUser,
		getAdminCategories,
		getAdminSettings,
		getAdminStats,
		getAdminUsers,
		getArticleNotificationsCount,
		resendAdminUserVerification,
		saveAdminSettings,
		scanAdminStorageGc,
		sendAdminTestEmail,
		updateAdminCategory,
		updateAdminUser,
		verifyAdminUser
	} from '$lib/forum/api/admin';
	import { getSession } from '$lib/forum/api/auth';
	import { forumAuth } from '$lib/forum/stores/auth';
	import { forumEnv } from '$lib/forum/stores/env';
	import type {
		AdminEmailTestResult,
		AdminStats,
		AdminStorageGcScanResult,
		AdminUserUpdatePayload,
		ForumAdminSettings
	} from '$lib/forum/types/api';
	import type { ForumCategory } from '$lib/forum/types/post';
	import type { ForumUser } from '$lib/forum/types/user';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	const defaultSettings: ForumAdminSettings = {
		turnstileEnabled: false,
		notifyOnUserDelete: false,
		notifyOnPostDelete: false,
		notifyOnUsernameChange: false,
		notifyOnAvatarChange: false,
		notifyOnManualVerify: false,
		sessionTtlDays: 7
	};

	const emailTemplateOptions = [
		{ value: 'smtp_test', label: 'SMTP 测试邮件' },
		{ value: 'reset_password', label: '密码重置邮件' },
		{ value: 'change_email_confirm', label: '更换邮箱确认邮件' },
		{ value: 'register_verify', label: '注册验证邮件' },
		{ value: 'admin_resend_verify', label: '后台重发验证邮件' },
		{ value: 'admin_avatar_updated', label: '后台头像更新通知' },
		{ value: 'admin_username_updated', label: '后台用户名更新通知' },
		{ value: 'admin_manual_verified', label: '后台手动验证通知' },
		{ value: 'admin_account_deleted', label: '后台删号通知' },
		{ value: 'post_new_comment', label: '帖子新评论提醒' },
		{ value: 'comment_new_reply', label: '评论新回复提醒' }
	] as const;

	let loading = $state(true);
	let refreshing = $state(false);
	let isAdmin = $state(false);
	let currentUser = $state<ForumUser | null>(null);

	let stats = $state<AdminStats | null>(null);
	let settings = $state<ForumAdminSettings>({ ...defaultSettings });
	let users = $state<ForumUser[]>([]);
	let categories = $state<ForumCategory[]>([]);
	let articleNotificationsCount = $state(0);

	let userSearchQuery = $state('');
	let userSearching = $state(false);

	let newCategoryName = $state('');
	let editingCategoryId = $state('');
	let editingCategoryName = $state('');

	let emailTestTo = $state('');
	let emailTestTemplates = $state<string[]>(emailTemplateOptions.map((i) => i.value));
	let emailTesting = $state(false);
	let emailResults = $state<AdminEmailTestResult[]>([]);

	let editingUserId = $state('');
	let savingUserId = $state('');
	let userActionBusyId = $state('');
	let userActionType = $state('');
	let editingUserForm = $state({ username: '', email: '', avatarUrl: '', password: '' });
	let editingUserOriginal = { username: '', email: '', avatarUrl: '' };

	let storageScanning = $state(false);
	let storageCleaning = $state(false);
	let storageGcResult = $state<AdminStorageGcScanResult | null>(null);

	const USERS_PAGE_SIZE = 20;
	const HIDDEN = -1;
	const ADJ_DIST = 2;
	const VISIBLE = ADJ_DIST * 2 + 1;
	let usersPage = $state(1);

	let usersLastPage = $derived(Math.max(1, Math.ceil(users.length / USERS_PAGE_SIZE)));
	let pagedUsers = $derived(
		users.slice((usersPage - 1) * USERS_PAGE_SIZE, usersPage * USERS_PAGE_SIZE)
	);
	let userPages = $derived.by(() => {
		const lastPage = usersLastPage;
		let count = 1;
		let left = usersPage;
		let right = usersPage;
		while (0 < left - 1 && right + 1 <= lastPage && count + 2 <= VISIBLE) {
			count += 2;
			left -= 1;
			right += 1;
		}
		while (0 < left - 1 && count < VISIBLE) {
			count += 1;
			left -= 1;
		}
		while (right + 1 <= lastPage && count < VISIBLE) {
			count += 1;
			right += 1;
		}
		const values: number[] = [];
		if (left > 1) values.push(1);
		if (left === 3) values.push(2);
		if (left > 3) values.push(HIDDEN);
		for (let p = left; p <= right; p += 1) values.push(p);
		if (right < lastPage - 2) values.push(HIDDEN);
		if (right === lastPage - 2) values.push(lastPage - 1);
		if (right < lastPage) values.push(lastPage);
		return values;
	});

	$effect(() => {
		if (usersPage > usersLastPage) usersPage = usersLastPage;
		if (usersPage < 1) usersPage = 1;
	});

	function goToUserPage(p: number) {
		if (p < 1 || p > usersLastPage || p === usersPage) return;
		usersPage = p;
		if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function getErrorMessage(e: unknown, fb: string) {
		return e instanceof Error ? e.message : fb;
	}

	function formatLastSeen(iso?: string | null): string {
		if (!iso) return '从未上线';
		const normalized = /[Zz+\-]\d{0,2}:?\d{0,2}$/.test(iso) ? iso : `${iso}Z`;
		const then = new Date(normalized).getTime();
		if (Number.isNaN(then)) return '未知';
		const diff = Date.now() - then;
		if (diff < 0) return '刚刚';
		const s = Math.floor(diff / 1000);
		if (s < 60) return '刚刚';
		const m = Math.floor(s / 60);
		if (m < 60) return `${m}分钟前`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}小时前`;
		const d = Math.floor(h / 24);
		if (d < 30) return `${d}天前`;
		const mo = Math.floor(d / 30);
		if (mo < 12) return `${mo}个月前`;
		return `${Math.floor(mo / 12)}年前`;
	}

	async function refreshData(showLoading = false) {
		if (showLoading) loading = true;
		else refreshing = true;
		try {
			const [s, set, u, c, a] = await Promise.all([
				getAdminStats(),
				getAdminSettings(),
				getAdminUsers(userSearchQuery.trim()),
				getAdminCategories(),
				getArticleNotificationsCount()
			]);
			isAdmin = true;
			stats = s;
			settings = set;
			users = u;
			categories = c;
			articleNotificationsCount = a.count;
		} catch (e) {
			isAdmin = false;
			emitErrorToast('管理台', getErrorMessage(e, '管理台数据加载失败。'));
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	async function loadSession() {
		try {
			const session = await getSession();
			currentUser = session.user;
			forumAuth.setSession({ user: session.user, token: null, requiresTotp: false });
		} catch {
			currentUser = null;
		}
	}

	async function submitUserSearch() {
		if (loading || refreshing || userSearching) return;
		userSearching = true;
		usersPage = 1;
		try {
			await refreshData();
		} finally {
			userSearching = false;
		}
	}

	function resetUserSearch() {
		if (!userSearchQuery) return;
		userSearchQuery = '';
		void submitUserSearch();
	}

	async function saveSettingsAction() {
		try {
			await saveAdminSettings(settings);
			emitSuccessToast('站点设置', '站点设置已保存。', false);
		} catch (e) {
			emitErrorToast('站点设置', getErrorMessage(e, '站点设置保存失败。'));
		}
	}

	async function createCategoryAction() {
		if (!newCategoryName.trim()) return;
		try {
			await createAdminCategory(newCategoryName.trim());
			newCategoryName = '';
			await refreshData();
			emitSuccessToast('分类管理', '分类已添加。', false);
		} catch (e) {
			emitErrorToast('分类管理', getErrorMessage(e, '分类添加失败。'));
		}
	}

	async function saveCategoryAction(id: string) {
		if (!editingCategoryName.trim()) return;
		try {
			await updateAdminCategory(id, editingCategoryName.trim());
			editingCategoryId = '';
			editingCategoryName = '';
			await refreshData();
			emitSuccessToast('分类管理', '分类已更新。', false);
		} catch (e) {
			emitErrorToast('分类管理', getErrorMessage(e, '分类更新失败。'));
		}
	}

	async function deleteCategoryAction(id: string) {
		if (typeof window !== 'undefined' && !window.confirm('确定要删除这个分类吗？')) return;
		try {
			await deleteAdminCategory(id);
			await refreshData();
			emitSuccessToast('分类管理', '分类已删除。', false);
		} catch (e) {
			emitErrorToast('分类管理', getErrorMessage(e, '分类删除失败。'));
		}
	}

	function toggleAllEmailTemplates(checked: boolean) {
		emailTestTemplates = checked ? emailTemplateOptions.map((i) => i.value) : [];
	}

	let allEmailTemplatesSelected = $derived(
		emailTestTemplates.length === emailTemplateOptions.length
	);

	function toggleEmailTemplate(value: string, checked: boolean) {
		if (checked) {
			if (!emailTestTemplates.includes(value)) emailTestTemplates = [...emailTestTemplates, value];
		} else {
			emailTestTemplates = emailTestTemplates.filter((v) => v !== value);
		}
	}

	async function sendEmailTestAction() {
		if (!emailTestTo.trim() || emailTesting || emailTestTemplates.length === 0) return;
		emailTesting = true;
		try {
			if (allEmailTemplatesSelected) {
				emailResults = await sendAdminTestEmail({ to: emailTestTo.trim(), template: 'all' });
			} else {
				const groups = await Promise.all(
					emailTestTemplates.map((template) =>
						sendAdminTestEmail({ to: emailTestTo.trim(), template })
					)
				);
				emailResults = groups.flat();
			}
			emitSuccessToast('邮件测试', emailResults.length ? '测试邮件已提交。' : '请求已提交。');
		} catch (e) {
			emailResults = [];
			emitErrorToast('邮件测试', getErrorMessage(e, '测试邮件发送失败。'));
		} finally {
			emailTesting = false;
		}
	}

	function isEditingUser(id: string) {
		return editingUserId === id;
	}

	function startEditUser(u: ForumUser) {
		if (savingUserId) return;
		editingUserId = u.id;
		editingUserForm = {
			username: u.username || '',
			email: u.email || '',
			avatarUrl: u.avatarUrl || '',
			password: ''
		};
		editingUserOriginal = {
			username: (u.username || '').trim(),
			email: (u.email || '').trim(),
			avatarUrl: u.avatarUrl || ''
		};
	}

	function cancelEditUser(force = false) {
		if (savingUserId && !force) return;
		editingUserId = '';
		editingUserForm = { username: '', email: '', avatarUrl: '', password: '' };
		editingUserOriginal = { username: '', email: '', avatarUrl: '' };
	}

	function hasUserActionConflict(id: string) {
		return (
			Boolean(userActionBusyId || savingUserId) ||
			(Boolean(editingUserId) && editingUserId !== id)
		);
	}

	function isValidEmail(email: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	function validateUserForm() {
		const u = editingUserForm.username.trim();
		const e = editingUserForm.email.trim();
		const p = editingUserForm.password;
		if (!u) return '用户名不能为空。';
		if (u.length > 20) return '用户名不能超过 20 字符。';
		if (e && e.length > 50) return '邮箱不能超过 50 字符。';
		if (e && !isValidEmail(e)) return '请输入有效的邮箱地址。';
		if (p && (p.length < 8 || p.length > 16)) return '密码必须为 8-16 位。';
		return '';
	}

	async function saveUserAction(userId: string) {
		if (!isEditingUser(userId) || savingUserId) return;
		const err = validateUserForm();
		if (err) {
			emitErrorToast('用户管理', err);
			return;
		}
		const username = editingUserForm.username.trim();
		const email = editingUserForm.email.trim();
		const avatarUrl = editingUserForm.avatarUrl.trim();
		const password = editingUserForm.password;
		const payload: AdminUserUpdatePayload = {};
		if (username !== editingUserOriginal.username) payload.username = username;
		if (email !== editingUserOriginal.email) payload.email = email;
		if (avatarUrl !== editingUserOriginal.avatarUrl) payload.avatarUrl = avatarUrl;
		if (password) payload.password = password;
		if (Object.keys(payload).length === 0) {
			emitErrorToast('用户管理', '没有需要保存的更改。');
			return;
		}
		savingUserId = userId;
		try {
			const r = await updateAdminUser(userId, payload);
			cancelEditUser(true);
			await refreshData();
			emitSuccessToast('用户管理', r.message || '用户资料已更新。', false);
		} catch (e) {
			emitErrorToast('用户管理', getErrorMessage(e, '用户资料更新失败。'));
		} finally {
			savingUserId = '';
		}
	}

	async function runUserAction(userId: string, action: 'verify' | 'resend' | 'delete') {
		if (userActionBusyId || savingUserId) return;
		if (
			action === 'delete' &&
			typeof window !== 'undefined' &&
			!window.confirm('确定要删除这个用户吗？此操作不可撤销。')
		)
			return;
		userActionBusyId = userId;
		userActionType = action;
		if (isEditingUser(userId)) cancelEditUser(true);
		try {
			const r =
				action === 'verify'
					? await verifyAdminUser(userId)
					: action === 'resend'
						? await resendAdminUserVerification(userId)
						: await deleteAdminUser(userId);
			await refreshData();
			emitSuccessToast(
				'用户管理',
				r.message ||
					(action === 'verify'
						? '用户已手动验证。'
						: action === 'resend'
							? '验证邮件已重新发送。'
							: '用户已删除。'),
				false
			);
		} catch (e) {
			emitErrorToast('用户管理', getErrorMessage(e, '用户操作失败。'));
		} finally {
			userActionBusyId = '';
			userActionType = '';
		}
	}

	let gcOrphans = $derived(storageGcResult?.orphans || []);
	let gcCount = $derived(storageGcResult?.orphaned_files ?? gcOrphans.length);

	async function scanStorageGcAction() {
		if (storageScanning) return;
		storageScanning = true;
		try {
			storageGcResult = await scanAdminStorageGc();
			emitSuccessToast(
				'存储清理',
				gcCount > 0 ? `分析完成，发现 ${gcCount} 个孤儿文件。` : '分析完成，未发现可清理的孤儿文件。',
				false
			);
		} catch (e) {
			storageGcResult = null;
			emitErrorToast('存储清理', getErrorMessage(e, '孤儿文件分析失败。'));
		} finally {
			storageScanning = false;
		}
	}

	async function cleanupStorageGcAction() {
		if (storageCleaning || !storageGcResult || gcCount === 0) return;
		if (
			typeof window !== 'undefined' &&
			!window.confirm(`确定要清理这 ${gcCount} 个孤儿文件吗？删除任务会异步执行。`)
		)
			return;
		storageCleaning = true;
		try {
			const r = await cleanupAdminStorageGc(gcOrphans);
			emitSuccessToast('存储清理', r.message || `已提交 ${gcCount} 个孤儿文件的删除任务。`, false);
		} catch (e) {
			emitErrorToast('存储清理', getErrorMessage(e, '孤儿文件清理失败。'));
		} finally {
			storageCleaning = false;
		}
	}

	onMount(async () => {
		await loadSession();
		await refreshData(true);
	});
</script>

<svelte:head>
	<title>管理控制台 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-12 space-y-5">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:shield-crown-outline" class="size-6 text-primary" />
					论坛管理控制台
				</CardTitle>
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" href="/forum/">
						<Icon icon="mdi:arrow-left" class="size-4" />
						返回论坛
					</Button>
					<Button variant="outline" href="/forum/me/">
						<Icon icon="mdi:account" class="size-4" />
						个人中心
					</Button>
					<Button
						variant="outline"
						onclick={() => refreshData()}
						disabled={refreshing || loading}
					>
						<Icon
							icon="mdi:refresh"
							class="size-4 {refreshing ? 'animate-spin' : ''}"
						/>
						{refreshing ? '刷新中...' : '刷新数据'}
					</Button>
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if loading}
				<div class="space-y-3">
					<div class="h-20 rounded bg-muted/70"></div>
					<div class="h-32 rounded bg-muted/70"></div>
				</div>
			{:else if !isAdmin}
				<Alert variant="destructive">
					<Icon icon="mdi:shield-off-outline" />
					<AlertDescription class="space-y-1">
						<p>当前账号不是管理员，无法进入论坛管理控制台。</p>
						<p class="text-xs opacity-80">
							当前会话角色：{currentUser?.role || '未读取到'}
						</p>
					</AlertDescription>
				</Alert>
			{:else}
				<!-- 统计 -->
				<div class="grid gap-3 md:grid-cols-4">
					<div class="rounded-md border p-4">
						<div class="text-sm text-muted-foreground">用户总数</div>
						<div class="mt-1 text-2xl font-bold">{stats?.users ?? 0}</div>
					</div>
					<div class="rounded-md border p-4">
						<div class="text-sm text-muted-foreground">帖子总数</div>
						<div class="mt-1 text-2xl font-bold">{stats?.posts ?? 0}</div>
					</div>
					<div class="rounded-md border p-4">
						<div class="text-sm text-muted-foreground">评论总数</div>
						<div class="mt-1 text-2xl font-bold">{stats?.comments ?? 0}</div>
					</div>
					<div class="rounded-md border p-4">
						<div class="text-sm text-muted-foreground">文章订阅人数</div>
						<div class="mt-1 text-2xl font-bold">{articleNotificationsCount}</div>
					</div>
				</div>

				<div class="grid gap-5 xl:grid-cols-2">
					<!-- 站点设置 -->
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">站点设置</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							{#each [
								{ key: 'turnstileEnabled', label: '启用 Turnstile' },
								{ key: 'notifyOnUserDelete', label: '删除账号时通知用户' },
								{ key: 'notifyOnPostDelete', label: '删除帖子时通知用户' },
								{ key: 'notifyOnUsernameChange', label: '修改用户名时通知用户' },
								{ key: 'notifyOnAvatarChange', label: '修改头像时通知用户' },
								{ key: 'notifyOnManualVerify', label: '手动验证时通知用户' }
							] as item (item.key)}
								<div class="flex items-center justify-between gap-3 rounded-md border p-3">
									<Label for={`set-${item.key}`} class="m-0 flex-1 cursor-pointer">
										{item.label}
									</Label>
									<Switch
										id={`set-${item.key}`}
										checked={Boolean((settings as unknown as Record<string, boolean>)[item.key])}
										onCheckedChange={(v) => {
											(settings as unknown as Record<string, boolean>)[item.key] = v;
										}}
									/>
								</div>
							{/each}
							<div class="space-y-2">
								<Label for="session-ttl">登录态有效天数</Label>
								<Input
									id="session-ttl"
									type="number"
									min="1"
									max="365"
									bind:value={settings.sessionTtlDays}
								/>
							</div>
							<Button onclick={saveSettingsAction}>
								<Icon icon="mdi:content-save-outline" class="size-4" />
								保存设置
							</Button>
						</CardContent>
					</Card>

					<!-- 邮件测试 -->
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">邮件测试</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<div class="space-y-2">
								<Label for="email-to">收件邮箱</Label>
								<Input
									id="email-to"
									type="email"
									bind:value={emailTestTo}
									placeholder="name@example.com"
								/>
							</div>
							<div class="flex items-center justify-between">
								<Label class="m-0">测试模板</Label>
								<label class="flex cursor-pointer items-center gap-2 text-sm">
									<Checkbox
										checked={allEmailTemplatesSelected}
										onCheckedChange={(v) => toggleAllEmailTemplates(v === true)}
									/>
									全选
								</label>
							</div>
							<div class="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
								{#each emailTemplateOptions as option (option.value)}
									<label class="flex cursor-pointer items-center gap-2 text-sm">
										<Checkbox
											checked={emailTestTemplates.includes(option.value)}
											onCheckedChange={(v) => toggleEmailTemplate(option.value, v === true)}
										/>
										{option.label}
									</label>
								{/each}
							</div>
							<p class="text-xs text-muted-foreground">
								已选择 {emailTestTemplates.length} / {emailTemplateOptions.length} 个模板。
							</p>
							<Button
								variant="outline"
								onclick={sendEmailTestAction}
								disabled={emailTesting ||
									!emailTestTo.trim() ||
									emailTestTemplates.length === 0}
							>
								{#if emailTesting}
									<Icon icon="mdi:loading" class="size-4 animate-spin" />
								{:else}
									<Icon icon="mdi:email-fast-outline" class="size-4" />
								{/if}
								{emailTesting
									? '测试中...'
									: allEmailTemplatesSelected
										? '测试全部模板'
										: `发送 ${emailTestTemplates.length} 个测试模板`}
							</Button>
							{#if emailResults.length > 0}
								<div class="space-y-2">
									{#each emailResults as r, i (i)}
										<div class="rounded-md border p-3 text-sm">
											<div class="font-bold">{r.label || r.template}</div>
											<div class={r.success ? 'text-emerald-500' : 'text-destructive'}>
												{r.success ? '发送成功' : r.error || '发送失败'}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</CardContent>
					</Card>
				</div>

				<!-- S3 GC -->
				<Card>
					<CardHeader>
						<div class="flex flex-wrap items-center justify-between gap-3">
							<CardTitle class="text-lg">S3 无关联文件 GC</CardTitle>
							<div class="flex flex-wrap gap-2">
								<Button
									variant="outline"
									onclick={scanStorageGcAction}
									disabled={storageScanning || storageCleaning}
								>
									{#if storageScanning}
										<Icon icon="mdi:loading" class="size-4 animate-spin" />
									{:else}
										<Icon icon="mdi:magnify-scan" class="size-4" />
									{/if}
									{storageScanning ? '分析中...' : '分析孤儿文件'}
								</Button>
								<Button
									variant="destructive"
									onclick={cleanupStorageGcAction}
									disabled={storageCleaning ||
										storageScanning ||
										!storageGcResult ||
										gcCount === 0}
								>
									{#if storageCleaning}
										<Icon icon="mdi:loading" class="size-4 animate-spin" />
									{:else}
										<Icon icon="mdi:delete-sweep-outline" class="size-4" />
									{/if}
									{storageCleaning ? '提交中...' : '确认执行清理'}
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<p class="mb-3 text-sm text-muted-foreground">
							先分析孤儿文件，再二次确认后异步提交删除任务。
						</p>
						{#if storageGcResult}
							<div class="rounded-md border p-3 text-sm space-y-3">
								<div class="flex flex-wrap gap-x-6 gap-y-2">
									<div>总文件数：<span class="font-bold">{storageGcResult.total_files ?? 0}</span></div>
									<div>已引用：<span class="font-bold">{storageGcResult.used_files ?? 0}</span></div>
									<div>孤儿文件：<span class="font-bold">{gcCount}</span></div>
								</div>
								{#if gcOrphans.length > 0}
									<div class="space-y-1">
										<div class="text-xs uppercase tracking-wide text-muted-foreground">
											孤儿对象样本
										</div>
										{#each gcOrphans.slice(0, 8) as item, i (i)}
											<div class="break-all rounded bg-muted px-3 py-2 font-mono text-xs">
												{item}
											</div>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- 分类管理 -->
				<Card>
					<CardHeader>
						<CardTitle class="text-lg">分类管理</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="flex flex-col gap-2 sm:flex-row">
							<Input
								bind:value={newCategoryName}
								placeholder="新增分类名称"
								class="flex-1"
								onkeydown={(e) => e.key === 'Enter' && createCategoryAction()}
							/>
							<Button onclick={createCategoryAction} disabled={!newCategoryName.trim()}>
								<Icon icon="mdi:plus" class="size-4" />
								添加
							</Button>
						</div>
						<div class="space-y-2">
							{#if categories.length === 0}
								<p class="text-sm text-muted-foreground">暂无分类数据。</p>
							{:else}
								{#each categories as category (category.id)}
									<div class="rounded-md border p-3">
										{#if editingCategoryId === category.id}
											<div class="flex flex-col gap-2 sm:flex-row">
												<Input bind:value={editingCategoryName} class="flex-1" />
												<div class="flex gap-2">
													<Button onclick={() => saveCategoryAction(category.id)}>
														<Icon icon="mdi:check" class="size-4" />
														保存
													</Button>
													<Button
														variant="outline"
														onclick={() => {
															editingCategoryId = '';
															editingCategoryName = '';
														}}
													>
														取消
													</Button>
												</div>
											</div>
										{:else}
											<div class="flex flex-wrap items-center justify-between gap-3">
												<div>
													<div class="font-bold">{category.name}</div>
													{#if category.description}
														<div class="text-sm text-muted-foreground">{category.description}</div>
													{/if}
												</div>
												<div class="flex flex-wrap gap-2">
													<Button
														variant="outline"
														size="sm"
														onclick={() => {
															editingCategoryId = category.id;
															editingCategoryName = category.name;
														}}
													>
														<Icon icon="mdi:pencil" class="size-4" />
														编辑
													</Button>
													<Button
														variant="destructive"
														size="sm"
														onclick={() => deleteCategoryAction(category.id)}
													>
														<Icon icon="mdi:trash-can-outline" class="size-4" />
														删除
													</Button>
												</div>
											</div>
										{/if}
									</div>
								{/each}
							{/if}
						</div>
					</CardContent>
				</Card>

				<!-- 用户列表 -->
				<Card>
					<CardHeader>
						<div class="flex flex-wrap items-center justify-between gap-3">
							<CardTitle class="text-lg">用户列表</CardTitle>
							<div class="flex w-full flex-wrap gap-2 md:w-auto">
								<Input
									bind:value={userSearchQuery}
									placeholder="搜索用户名或邮箱"
									class="min-w-0 flex-1 md:w-64"
									onkeydown={(e) => e.key === 'Enter' && submitUserSearch()}
								/>
								<Button
									variant="outline"
									onclick={submitUserSearch}
									disabled={loading || refreshing || userSearching}
								>
									<Icon icon="mdi:magnify" class="size-4" />
									{userSearching ? '搜索中...' : '搜索'}
								</Button>
								<Button
									variant="outline"
									onclick={resetUserSearch}
									disabled={loading || refreshing || userSearching || !userSearchQuery}
								>
									<Icon icon="mdi:close" class="size-4" />
									清空
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent class="space-y-3">
						<div class="text-sm text-muted-foreground">
							{#if userSearchQuery.trim()}
								当前搜索：<span class="text-foreground">{userSearchQuery.trim()}</span> · 共
								{users.length} 条结果
							{:else}
								当前显示全部用户 · 共 {users.length} 条
							{/if}
						</div>

						<div class="space-y-3">
							{#each pagedUsers as forumUser (forumUser.id)}
								<div class="rounded-md border p-3">
									<div class="flex flex-wrap items-start gap-3">
										{#if forumUser.avatarUrl}
											<img
												src={forumUser.avatarUrl}
												alt={forumUser.username}
												class="size-10 rounded-full object-cover"
												loading="lazy"
												referrerpolicy="no-referrer"
											/>
										{:else}
											<span
												class="inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
											>
												<Icon icon="mdi:account" class="size-5" />
											</span>
										{/if}
										<div class="min-w-0 flex-1">
											<div class="flex flex-wrap items-center gap-2">
												<span
													class="truncate font-bold"
													title={forumUser.displayName || forumUser.username}
												>
													{forumUser.displayName || forumUser.username}
												</span>
												<Badge variant="secondary">{forumUser.role || 'user'}</Badge>
												{#if forumUser.verified}
													<Badge>已验证</Badge>
												{:else}
													<Badge variant="destructive">未验证</Badge>
												{/if}
												{#if forumUser.totpEnabled}
													<Badge variant="secondary">2FA</Badge>
												{/if}
											</div>
											<div class="mt-1 break-all text-sm text-muted-foreground">
												{forumUser.email || '-'}
											</div>
											<div class="text-xs text-muted-foreground" title={forumUser.lastSeenAt || ''}>
												最后上线：{formatLastSeen(forumUser.lastSeenAt)}
											</div>
										</div>
										<div class="flex flex-wrap items-start gap-2">
											{#if !isEditingUser(forumUser.id)}
												<Button
													variant="outline"
													size="sm"
													onclick={() => startEditUser(forumUser)}
													disabled={hasUserActionConflict(forumUser.id)}
												>
													<Icon icon="mdi:pencil" class="size-4" />
													编辑
												</Button>
												{#if !forumUser.verified}
													<Button
														variant="outline"
														size="sm"
														onclick={() => runUserAction(forumUser.id, 'resend')}
														disabled={userActionBusyId === forumUser.id ||
															Boolean(editingUserId)}
													>
														<Icon icon="mdi:email-arrow-right-outline" class="size-4" />
														{userActionBusyId === forumUser.id && userActionType === 'resend'
															? '发送中...'
															: '重发验证'}
													</Button>
													<Button
														size="sm"
														onclick={() => runUserAction(forumUser.id, 'verify')}
														disabled={userActionBusyId === forumUser.id || Boolean(editingUserId)}
													>
														<Icon icon="mdi:check-decagram-outline" class="size-4" />
														{userActionBusyId === forumUser.id && userActionType === 'verify'
															? '处理中...'
															: '手动通过'}
													</Button>
												{/if}
												<Button
													variant="destructive"
													size="sm"
													onclick={() => runUserAction(forumUser.id, 'delete')}
													disabled={userActionBusyId === forumUser.id || Boolean(editingUserId)}
												>
													<Icon icon="mdi:trash-can-outline" class="size-4" />
													{userActionBusyId === forumUser.id && userActionType === 'delete'
														? '删除中...'
														: '删除'}
												</Button>
											{/if}
										</div>
									</div>

									{#if isEditingUser(forumUser.id)}
										<div class="mt-3 grid gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-2">
											<div class="space-y-1">
												<Label for={`u-name-${forumUser.id}`}>用户名</Label>
												<Input
													id={`u-name-${forumUser.id}`}
													bind:value={editingUserForm.username}
													maxlength={20}
												/>
											</div>
											<div class="space-y-1">
												<Label for={`u-email-${forumUser.id}`}>邮箱</Label>
												<Input
													id={`u-email-${forumUser.id}`}
													type="email"
													bind:value={editingUserForm.email}
												/>
											</div>
											<div class="space-y-1 sm:col-span-2">
												<Label for={`u-avatar-${forumUser.id}`}>头像 URL</Label>
												<Input
													id={`u-avatar-${forumUser.id}`}
													bind:value={editingUserForm.avatarUrl}
												/>
											</div>
											<div class="space-y-1">
												<Label for={`u-pwd-${forumUser.id}`}>新密码（留空不变）</Label>
												<Input
													id={`u-pwd-${forumUser.id}`}
													type="password"
													bind:value={editingUserForm.password}
													minlength={8}
													maxlength={16}
												/>
											</div>
											<div class="flex items-end gap-2 sm:col-span-2">
												<Button
													onclick={() => saveUserAction(forumUser.id)}
													disabled={Boolean(savingUserId)}
												>
													{#if savingUserId === forumUser.id}
														<Icon icon="mdi:loading" class="size-4 animate-spin" />
													{:else}
														<Icon icon="mdi:content-save-outline" class="size-4" />
													{/if}
													{savingUserId === forumUser.id ? '保存中...' : '保存编辑'}
												</Button>
												<Button
													variant="outline"
													onclick={() => cancelEditUser()}
													disabled={Boolean(savingUserId)}
												>
													取消
												</Button>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>

						{#if usersLastPage > 1}
							<div class="flex flex-col items-center gap-2 pt-2">
								<div class="flex flex-row justify-center gap-2">
									<Button
										variant="outline"
										size="icon"
										disabled={usersPage === 1}
										onclick={() => goToUserPage(usersPage - 1)}
										aria-label="上一页"
									>
										<Icon icon="mdi:chevron-left" class="size-5" />
									</Button>
									<div class="flex items-center gap-1">
										{#each userPages as page, i (i)}
											{#if page === HIDDEN}
												<span class="flex size-9 items-center justify-center text-muted-foreground">
													<Icon icon="mdi:dots-horizontal" />
												</span>
											{:else if page === usersPage}
												<Button size="icon" disabled>{page}</Button>
											{:else}
												<Button
													variant="outline"
													size="icon"
													onclick={() => goToUserPage(page)}
													aria-label="第 {page} 页"
												>
													{page}
												</Button>
											{/if}
										{/each}
									</div>
									<Button
										variant="outline"
										size="icon"
										disabled={usersPage === usersLastPage}
										onclick={() => goToUserPage(usersPage + 1)}
										aria-label="下一页"
									>
										<Icon icon="mdi:chevron-right" class="size-5" />
									</Button>
								</div>
								<p class="text-xs text-muted-foreground">
									第 {usersPage} / {usersLastPage} 页，共 {users.length} 名用户
								</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			{/if}
		</CardContent>
	</Card>
</div>
