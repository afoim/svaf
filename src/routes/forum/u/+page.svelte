<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import PostList from '$lib/components/forum/PostList.svelte';
	import { getSession } from '$lib/forum/api/auth';
	import { getUserPosts, getUserProfile } from '$lib/forum/api/users';
	import { forumAuth } from '$lib/forum/stores/auth';
	import type { ForumPostSummary } from '$lib/forum/types/post';
	import type { ForumUser } from '$lib/forum/types/user';
	import { formatForumDateTime } from '$lib/forum/utils/markdown';

	let userId = $state('');
	let profile = $state<ForumUser | null>(null);
	let posts = $state<ForumPostSummary[]>([]);
	let loading = $state(true);
	let postsLoading = $state(true);
	let errorMessage = $state('');

	function genderLabel(g?: ForumUser['gender']) {
		switch (g) {
			case 'male':
				return '男';
			case 'female':
				return '女';
			case 'other':
				return '其他';
			case 'prefer_not_to_say':
				return '不方便透露';
			default:
				return '未设置';
		}
	}

	function resolveUserId() {
		if (typeof window === 'undefined') return '';
		const params = new URLSearchParams(window.location.search);
		const id = params.get('id');
		if (id) return decodeURIComponent(id);
		const m = window.location.pathname.match(/\/forum\/u\/([^/]+)\/?$/);
		return m?.[1] ? decodeURIComponent(m[1]) : '';
	}

	async function hydrateSession() {
		if (!forumAuth.getToken()) return;
		try {
			const session = await getSession();
			forumAuth.setSession(session);
		} catch {
			// 静默
		}
	}

	async function loadPage() {
		loading = true;
		postsLoading = true;
		errorMessage = '';
		try {
			void hydrateSession();
			const id = resolveUserId();
			if (!id) throw new Error('用户 ID 无效。');
			userId = id;
			const [p, list] = await Promise.all([
				getUserProfile(id),
				getUserPosts(id, { pageSize: 20 })
			]);
			profile = p;
			posts = list.items;
			if (typeof document !== 'undefined' && p) {
				document.title = `${p.displayName || p.username} - 论坛 - 二叉树树`;
			}
		} catch (e) {
			profile = null;
			posts = [];
			errorMessage = e instanceof Error ? e.message : '用户主页加载失败。';
		} finally {
			loading = false;
			postsLoading = false;
		}
	}

	let isSelf = $derived(
		Boolean(profile && $forumAuth.user && profile.id === $forumAuth.user.id)
	);

	onMount(() => {
		void loadPage();
	});
</script>

<svelte:head>
	<title>用户主页 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12 space-y-5">
	{#if loading}
		<Card class="p-6 space-y-4">
			<div class="flex items-center gap-4">
				<div class="size-20 rounded-full bg-muted"></div>
				<div class="space-y-2">
					<div class="h-6 w-40 rounded bg-muted"></div>
					<div class="h-4 w-64 rounded bg-muted/70"></div>
				</div>
			</div>
			<div class="grid gap-3 md:grid-cols-4">
				{#each Array(4) as _, i (i)}
					<div class="h-16 rounded bg-muted/70"></div>
				{/each}
			</div>
		</Card>
	{:else if !profile}
		<Alert variant="destructive">
			<Icon icon="mdi:alert-circle-outline" />
			<AlertDescription class="space-y-1">
				<p>用户主页不可用。</p>
				{#if errorMessage}
					<p class="text-xs opacity-80">{errorMessage}</p>
				{/if}
			</AlertDescription>
		</Alert>
		<Button variant="outline" href="/forum/">
			<Icon icon="mdi:arrow-left" class="size-4" />
			返回论坛
		</Button>
	{:else}
		<Card>
			<CardHeader>
				<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div class="flex min-w-0 items-start gap-4">
						{#if profile.avatarUrl}
							<img
								src={profile.avatarUrl}
								alt={profile.displayName || profile.username || '用户头像'}
								class="size-20 rounded-full object-cover"
								loading="lazy"
								referrerpolicy="no-referrer"
							/>
						{:else}
							<div
								class="flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground"
							>
								<Icon icon="mdi:account" class="size-10" />
							</div>
						{/if}
						<div class="min-w-0 space-y-2">
							<div class="flex flex-wrap items-center gap-2">
								<CardTitle class="text-2xl break-words">
									{profile.displayName || profile.username}
								</CardTitle>
								{#if profile.role === 'admin'}
									<Badge>管理员</Badge>
								{/if}
								{#if profile.verified}
									<Badge variant="secondary">已验证</Badge>
								{/if}
							</div>
							{#if profile.bio}
								<p class="whitespace-pre-wrap text-sm text-muted-foreground">{profile.bio}</p>
							{/if}
						</div>
					</div>
					<div class="flex flex-wrap gap-2">
						<Button variant="outline" href="/forum/">
							<Icon icon="mdi:arrow-left" class="size-4" />
							返回论坛
						</Button>
						{#if isSelf}
							<Button variant="outline" href="/forum/me/">
								<Icon icon="mdi:account-cog-outline" class="size-4" />
								个人中心
							</Button>
						{/if}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div class="grid gap-3 md:grid-cols-4 text-sm">
					<div class="rounded-md border p-3">
						<div class="text-muted-foreground">性别</div>
						<div class="mt-1 font-bold">{genderLabel(profile.gender)}</div>
					</div>
					<div class="rounded-md border p-3">
						<div class="text-muted-foreground">年龄</div>
						<div class="mt-1 font-bold">{profile.age ?? '未设置'}</div>
					</div>
					<div class="rounded-md border p-3">
						<div class="text-muted-foreground">地区</div>
						<div class="mt-1 font-bold">{profile.region || '未设置'}</div>
					</div>
					<div class="rounded-md border p-3">
						<div class="text-muted-foreground">注册时间</div>
						<div class="mt-1 font-bold">
							{profile.createdAt ? formatForumDateTime(profile.createdAt) : '未知'}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<div class="flex items-center justify-between gap-3">
					<CardTitle class="text-lg">TA 发布的帖子</CardTitle>
					<Badge variant="secondary">{posts.length} 篇</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<PostList {posts} loading={postsLoading} emptyText="TA 暂时还没有公开帖子。" />
			</CardContent>
		</Card>
	{/if}
</div>
