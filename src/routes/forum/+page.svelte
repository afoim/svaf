<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import EnvironmentSwitcher from '$lib/components/forum/EnvironmentSwitcher.svelte';
	import PostList from '$lib/components/forum/PostList.svelte';
	import PageViews from '$lib/components/PageViews.svelte';
	import { getCategories } from '$lib/forum/api/categories';
	import {
		type ForumPostListQuery,
		getNewPostCount,
		getPosts,
		type NewPostCountResult
	} from '$lib/forum/api/posts';
	import { forumAuth } from '$lib/forum/stores/auth';
	import { forumEnv } from '$lib/forum/stores/env';
	import type { ForumCategory, ForumPostSummary } from '$lib/forum/types/post';

	const PAGE_SIZE = 20;
	const HIDDEN = -1;
	const ADJ_DIST = 2;
	const VISIBLE = ADJ_DIST * 2 + 1;

	const sortLabelMap: Record<string, string> = {
		latest: '最新发布',
		oldest: '最早发布',
		likes: '最多点赞',
		comments: '最多评论',
		views: '最多观看'
	};

	let posts = $state<ForumPostSummary[]>([]);
	let categories = $state<ForumCategory[]>([]);
	let loading = $state(true);
	let categoriesLoading = $state(true);
	let search = $state('');
	let sort = $state('latest');
	let category = $state('');
	let currentPage = $state(1);
	let total = $state(0);
	let lastPage = $state(1);
	let initialized = $state(false);
	let newPostCountResult = $state<NewPostCountResult | null>(null);

	function sanitizePage(value: string | null) {
		const p = Number.parseInt(value || '1', 10);
		return Number.isFinite(p) && p > 0 ? p : 1;
	}

	function readQueryState() {
		const params = new URLSearchParams(window.location.search);
		search = params.get('search') || '';
		sort = params.get('sort') || 'latest';
		category = params.get('category') || '';
		currentPage = sanitizePage(params.get('page'));
	}

	function writeQueryState() {
		const params = new URLSearchParams(window.location.search);
		if (search) params.set('search', search);
		else params.delete('search');
		if (sort && sort !== 'latest') params.set('sort', sort);
		else params.delete('sort');
		if (category) params.set('category', category);
		else params.delete('category');
		if (currentPage > 1) params.set('page', String(currentPage));
		else params.delete('page');
		const qs = params.toString();
		window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
	}

	async function loadPosts(page = currentPage, syncUrl = true) {
		loading = true;
		currentPage = page;
		if (syncUrl) writeQueryState();
		try {
			const query: ForumPostListQuery = {
				search: search || undefined,
				sort,
				category: category || undefined,
				page,
				pageSize: PAGE_SIZE
			};
			const result = await getPosts(query);
			if (Array.isArray(result)) {
				posts = result;
				total = result.length;
				lastPage = 1;
				currentPage = 1;
				writeQueryState();
				return;
			}
			posts = result.items;
			total = result.total || 0;
			lastPage = Math.max(1, Math.ceil((result.total || 0) / PAGE_SIZE));
			if (currentPage > lastPage) {
				currentPage = lastPage;
				writeQueryState();
			}
		} catch (err) {
			console.error(err);
			posts = [];
			total = 0;
			lastPage = 1;
		} finally {
			loading = false;
		}
	}

	function submitSearch() {
		loadPosts(1);
	}

	function changeSort(next: string) {
		if (sort === next) return;
		sort = next;
		loadPosts(1);
	}

	function changeCategory(next: string) {
		if (category === next) return;
		category = next;
		loadPosts(1);
	}

	function scrollTop() {
		if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function goToPage(p: number) {
		if (p < 1 || p > lastPage || p === currentPage || loading) return;
		scrollTop();
		loadPosts(p);
	}

	let pages = $derived.by(() => {
		let count = 1;
		let left = currentPage;
		let right = currentPage;
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

	async function loadCategories() {
		categoriesLoading = true;
		try {
			categories = await getCategories();
		} catch (err) {
			console.error(err);
			categories = [];
		} finally {
			categoriesLoading = false;
		}
	}

	async function checkNewPosts() {
		if (!forumAuth.getToken()) return;
		try {
			const r = await getNewPostCount();
			if (r && r.new_post_count > 0 && r.last_seen_at) newPostCountResult = r;
		} catch {
			// 静默
		}
	}

	// 切换 baseUrl 后自动刷新
	let isFirst = true;
	$effect(() => {
		const unsub = forumEnv.baseUrl.subscribe(() => {
			if (isFirst) {
				isFirst = false;
				return;
			}
			loadCategories();
			loadPosts(1, false);
		});
		return unsub;
	});

	let categoryDisplay = $derived(
		category ? categories.find((c) => c.id === category)?.name || category : '全部分类'
	);

	onMount(() => {
		readQueryState();
		loadCategories();
		loadPosts(currentPage, false);
		checkNewPosts();
		initialized = true;
		const handle = () => {
			readQueryState();
			loadPosts(currentPage, false);
		};
		window.addEventListener('popstate', handle);
		return () => window.removeEventListener('popstate', handle);
	});
</script>

<svelte:head>
	<title>论坛 - 二叉树树</title>
	<meta name="description" content="二叉树树官方论坛" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:forum" class="size-6 text-primary" />
					论坛
				</CardTitle>
				<PageViews pathname="/forum/" class="text-sm text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground leading-relaxed">
				i.2x.nz 论坛已将前端接入官网。如遇前端 Bug，请反馈至
				<a
					href="https://github.com/afoim/svaf/issues"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary underline decoration-dashed underline-offset-[6px]"
				>
					svaf
				</a>
				；如遇后端 Bug，请反馈至
				<a
					href="https://github.com/afoim/acofork_forum_backend/issues"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary underline decoration-dashed underline-offset-[6px]"
				>
					acofork_forum_backend
				</a>
				。
			</p>

			<div class="flex flex-wrap gap-3">
				<Button disabled title="后续阶段实现">
					<Icon icon="mdi:plus" class="size-4" />
					发布帖子
				</Button>
				<Button variant="outline" disabled title="后续阶段实现">
					<Icon icon="mdi:account" class="size-4" />
					个人中心
				</Button>
			</div>

			<EnvironmentSwitcher />

			{#if newPostCountResult && newPostCountResult.new_post_count > 0}
				<Alert>
					<Icon icon="mdi:bell-badge-outline" />
					<AlertDescription class="flex items-center justify-between gap-3">
						<span>
							距您上次上线，已有
							<span class="font-bold text-primary">{newPostCountResult.new_post_count}</span>
							篇新帖发布。
						</span>
						<Button
							variant="ghost"
							size="icon-sm"
							onclick={() => (newPostCountResult = null)}
							aria-label="关闭提醒"
						>
							<Icon icon="mdi:close" class="size-4" />
						</Button>
					</AlertDescription>
				</Alert>
			{/if}

			<div class="flex flex-col gap-3 lg:flex-row">
				<div class="flex min-w-0 flex-1 gap-2">
					<Input
						bind:value={search}
						placeholder="搜索帖子标题或内容，回车提交"
						onkeydown={(e) => e.key === 'Enter' && submitSearch()}
						class="min-w-0 flex-1"
					/>
					<Button variant="outline" size="icon" onclick={submitSearch} aria-label="搜索">
						<Icon icon="mdi:magnify" class="size-5" />
					</Button>
				</div>

				<Select
					type="single"
					value={category}
					onValueChange={(v) => changeCategory(v ?? '')}
					disabled={categoriesLoading}
				>
					<SelectTrigger class="lg:w-40">
						{categoryDisplay}
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">全部分类</SelectItem>
						{#each categories as item (item.id)}
							<SelectItem value={item.id}>{item.name}</SelectItem>
						{/each}
					</SelectContent>
				</Select>

				<Select type="single" value={sort} onValueChange={(v) => changeSort(v ?? 'latest')}>
					<SelectTrigger class="lg:w-36">
						{sortLabelMap[sort] || '最新发布'}
					</SelectTrigger>
					<SelectContent>
						{#each Object.entries(sortLabelMap) as [k, v] (k)}
							<SelectItem value={k}>{v}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>
		</CardContent>
	</Card>

	<PostList {posts} {loading} emptyText="当前环境暂无可展示的帖子。" />

	{#if !loading && lastPage > 1}
		<div class="flex flex-col items-center gap-3">
			<div class="flex flex-row justify-center gap-2">
				<Button
					variant="outline"
					size="icon"
					disabled={currentPage === 1}
					onclick={() => goToPage(currentPage - 1)}
					aria-label="上一页"
				>
					<Icon icon="mdi:chevron-left" class="size-5" />
				</Button>
				<div class="flex items-center gap-1">
					{#each pages as page, i (i)}
						{#if page === HIDDEN}
							<span class="flex size-9 items-center justify-center text-muted-foreground">
								<Icon icon="mdi:dots-horizontal" />
							</span>
						{:else if page === currentPage}
							<Button size="icon" disabled>{page}</Button>
						{:else}
							<Button
								variant="outline"
								size="icon"
								onclick={() => goToPage(page)}
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
					disabled={currentPage === lastPage}
					onclick={() => goToPage(currentPage + 1)}
					aria-label="下一页"
				>
					<Icon icon="mdi:chevron-right" class="size-5" />
				</Button>
			</div>
			<p class="text-center text-sm text-muted-foreground">
				第 {currentPage} / {lastPage} 页，共 {total} 帖
			</p>
		</div>
	{/if}

	{#if initialized && !loading && total === 0 && (search || sort !== 'latest' || category)}
		<p class="text-center text-sm text-muted-foreground">
			当前筛选条件：{search ? `搜索"${search}"` : '全部帖子'}{category
				? ` · 分类 ${categories.find((i) => i.id === category)?.name || category}`
				: ''}{sort !== 'latest' ? ` · 排序 ${sortLabelMap[sort] || sort}` : ''}
		</p>
	{/if}
</div>
