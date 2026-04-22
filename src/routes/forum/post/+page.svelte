<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { goto } from '$app/navigation';
	import ForumMarkdownContent from '$lib/components/forum/ForumMarkdownContent.svelte';
	import ForumMarkdownEditor from '$lib/components/forum/ForumMarkdownEditor.svelte';
	import CommentItem from '$lib/components/forum/CommentItem.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { deletePost, getPost, updatePost } from '$lib/forum/api/posts';
	import { getCategories } from '$lib/forum/api/categories';
	import { getSession } from '$lib/forum/api/auth';
	import {
		buildCommentTree,
		createComment,
		getComments,
		type CommentListQuery
	} from '$lib/forum/api/comments';
	import { ForumApiError } from '$lib/forum/types/api';
	import type { ForumCategory, ForumPostDetail } from '$lib/forum/types/post';
	import type { ForumComment } from '$lib/forum/types/comment';
	import { formatForumDateTime } from '$lib/forum/utils/markdown';
	import { forumEnv } from '$lib/forum/stores/env';
	import { forumAuth } from '$lib/forum/stores/auth';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	let postId = $state('');
	let post = $state<ForumPostDetail | null>(null);
	let comments = $state<ForumComment[]>([]);
	let loading = $state(true);
	let commentsLoading = $state(true);
	let loadErrorKind = $state<'not-found' | 'unreachable' | 'unknown' | null>(null);
	let loadErrorMessage = $state('');
	let commentSort = $state('hot');
	let commentDraft = $state('');
	let commentSubmitting = $state(false);

	let editing = $state(false);
	let editTitle = $state('');
	let editContent = $state('');
	let editCategoryId = $state('');
	let editSubmitting = $state(false);
	let categories = $state<ForumCategory[]>([]);
	let categoriesLoaded = $state(false);

	let composerExpanded = $state(false);

	let commentCount = $derived.by(() => {
		const walk = (list: ForumComment[]): number =>
			list.reduce((acc, c) => acc + 1 + (c.replies ? walk(c.replies) : 0), 0);
		return walk(comments);
	});

	let canEdit = $derived.by(() => {
		const u = $forumAuth.user;
		if (!u) return false;
		if (u.role === 'admin') return true;
		if (!post) return false;
		return Boolean(u.id) && u.id === post.authorId;
	});

	const sortLabels: Record<string, string> = {
		hot: '最热',
		oldest: '最早',
		latest: '最新'
	};

	function getSortQuery(sort: string): CommentListQuery {
		switch (sort) {
			case 'oldest':
				return { sortBy: 'time', sortDir: 'asc' };
			case 'latest':
				return { sortBy: 'time', sortDir: 'desc' };
			case 'hot':
			default:
				return { sortBy: 'likes', sortDir: 'desc' };
		}
	}

	async function loadPost() {
		loading = true;
		loadErrorKind = null;
		loadErrorMessage = '';
		try {
			post = await getPost(postId);
			if (typeof document !== 'undefined' && post.title) {
				document.title = `${post.title} - 论坛 - 二叉树树`;
			}
		} catch (e) {
			console.error(e);
			post = null;
			if (e instanceof ForumApiError) {
				if (e.status === 404) {
					loadErrorKind = 'not-found';
					loadErrorMessage = e.message || '帖子不存在。';
				} else {
					loadErrorKind = 'unreachable';
					loadErrorMessage = e.message || '论坛接口当前不可访问。';
				}
			} else {
				loadErrorKind = 'unknown';
				loadErrorMessage = e instanceof Error ? e.message : '帖子加载失败。';
			}
		} finally {
			loading = false;
		}
	}

	async function loadComments() {
		commentsLoading = true;
		try {
			const flat = await getComments(postId, getSortQuery(commentSort));
			comments = buildCommentTree(flat);
		} catch (e) {
			console.error(e);
			comments = [];
		} finally {
			commentsLoading = false;
		}
	}

	function changeCommentSort(next: string) {
		if (commentSort === next || commentsLoading) return;
		commentSort = next;
		void loadComments();
	}

	async function submitComment() {
		const content = commentDraft.trim();
		if (!content || commentSubmitting || !postId) return;
		if (!forumAuth.getToken()) {
			emitErrorToast('评论', '请先登录后再发表评论。');
			return;
		}
		commentSubmitting = true;
		try {
			await createComment({ postId, content });
			commentDraft = '';
			composerExpanded = false;
			emitSuccessToast('评论', '评论已发表。');
			await loadComments();
		} catch (e) {
			emitErrorToast('评论', e instanceof Error ? e.message : '评论失败，请稍后再试。');
		} finally {
			commentSubmitting = false;
		}
	}

	function cancelCompose() {
		composerExpanded = false;
		commentDraft = '';
	}

	async function ensureCategoriesLoaded() {
		if (categoriesLoaded) return;
		try {
			categories = await getCategories();
		} catch (e) {
			console.error(e);
			categories = [];
		} finally {
			categoriesLoaded = true;
		}
	}

	async function startEdit() {
		if (!post) return;
		editTitle = post.title || '';
		editContent = post.content || '';
		editCategoryId = post.categoryId || post.category?.id || '';
		editing = true;
		await ensureCategoriesLoaded();
	}

	function cancelEdit() {
		editing = false;
	}

	async function saveEdit() {
		if (!post || editSubmitting) return;
		const title = editTitle.trim();
		const content = editContent.trim();
		if (!title) {
			emitErrorToast('编辑帖子', '标题不能为空。');
			return;
		}
		if (!content) {
			emitErrorToast('编辑帖子', '内容不能为空。');
			return;
		}
		editSubmitting = true;
		try {
			const updated = await updatePost(post.id, {
				title,
				content,
				categoryId: editCategoryId || undefined
			});
			post = { ...post, ...updated };
			editing = false;
			emitSuccessToast('编辑帖子', '保存成功。');
			if (typeof document !== 'undefined' && post.title) {
				document.title = `${post.title} - 论坛 - 二叉树树`;
			}
		} catch (e) {
			emitErrorToast('编辑帖子', e instanceof Error ? e.message : '保存失败，请稍后再试。');
		} finally {
			editSubmitting = false;
		}
	}

	async function removePost() {
		if (!post) return;
		if (typeof window !== 'undefined' && !window.confirm('确认删除这篇帖子？此操作不可撤销。'))
			return;
		try {
			await deletePost(post.id);
			emitSuccessToast('删除帖子', '帖子已删除。');
			void goto('/forum/');
		} catch (e) {
			emitErrorToast('删除帖子', e instanceof Error ? e.message : '删除失败，请稍后再试。');
		}
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

	function resolvePostId() {
		if (typeof window === 'undefined') return '';
		return new URLSearchParams(window.location.search).get('id') || '';
	}

	let isFirst = true;
	$effect(() => {
		const unsub = forumEnv.baseUrl.subscribe(() => {
			if (isFirst) {
				isFirst = false;
				return;
			}
			if (postId) {
				loadPost();
				loadComments();
			}
		});
		return unsub;
	});

	onMount(() => {
		postId = resolvePostId();
		void hydrateSession();
		if (postId) {
			loadPost();
			loadComments();
		} else {
			loading = false;
			commentsLoading = false;
		}
	});
</script>

<svelte:head>
	<title>帖子 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12 space-y-5">
	{#if loading}
		<Card class="p-6 space-y-4">
			<div class="h-8 w-2/3 rounded bg-muted"></div>
			<div class="h-4 w-1/3 rounded bg-muted/70"></div>
			<div class="space-y-2 pt-4">
				<div class="h-4 w-full rounded bg-muted/70"></div>
				<div class="h-4 w-full rounded bg-muted/70"></div>
				<div class="h-4 w-3/4 rounded bg-muted/70"></div>
			</div>
		</Card>
	{:else if !post}
		<Alert variant="destructive">
			<Icon icon="mdi:alert-circle-outline" />
			<AlertDescription class="space-y-1">
				{#if loadErrorKind === 'not-found'}
					<p>帖子不存在。</p>
				{:else if loadErrorKind === 'unreachable'}
					<p>论坛接口当前不可访问或环境地址错误。</p>
				{:else}
					<p>帖子加载失败。</p>
				{/if}
				{#if loadErrorMessage}
					<p class="text-xs opacity-80">{loadErrorMessage}</p>
				{/if}
			</AlertDescription>
		</Alert>
		<div>
			<a href="/forum">
				<Button variant="outline">
					<Icon icon="mdi:arrow-left" class="size-4" />
					返回论坛首页
				</Button>
			</a>
		</div>
	{:else}
		<article>
			<Card class="p-6 md:p-8">
				<div class="mb-6 flex flex-col gap-4 border-b pb-6">
					<div class="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
						<div class="flex flex-wrap items-center gap-3">
							{#if post.isPinned}
								<Badge variant="default" class="gap-1">
									<Icon icon="mdi:pin" class="size-3.5" />
									置顶
								</Badge>
							{/if}
							<Badge variant="secondary">{post.category?.name || '未分类'}</Badge>

							<div class="flex items-center gap-2">
								{#if post.author?.avatarUrl}
									<img
										src={post.author.avatarUrl}
										alt={post.author.displayName || post.author.username}
										referrerpolicy="no-referrer"
										loading="lazy"
										class="size-8 rounded-full object-cover"
									/>
								{:else}
									<span class="flex size-8 items-center justify-center rounded-full bg-muted">
										<Icon icon="mdi:account" class="size-5" />
									</span>
								{/if}
								<span class="text-foreground">
									{post.author?.displayName || post.author?.username || '匿名用户'}
								</span>
							</div>
							<span>{formatForumDateTime(post.updatedAt || post.createdAt)}</span>
						</div>

						<div class="flex flex-wrap items-center gap-2">
							<a href="/forum">
								<Button variant="outline" size="sm">
									<Icon icon="mdi:arrow-left" class="size-4" />
									返回
								</Button>
							</a>
							<Button variant="outline" size="sm" disabled title="下一阶段实现">
								<Icon icon="mdi:eye-outline" class="size-4" />
								{post.viewCount || 0}
							</Button>
							<Button variant="outline" size="sm" disabled title="登录后可点赞">
								<Icon
									icon={post.liked ? 'mdi:heart' : 'mdi:heart-outline'}
									class="size-4 {post.liked ? 'text-primary' : ''}"
								/>
								{post.likeCount || 0}
							</Button>
							{#if canEdit && !editing}
								<Button variant="outline" size="sm" onclick={startEdit}>
									<Icon icon="mdi:pencil" class="size-4" />
									编辑
								</Button>
								<Button variant="outline" size="sm" onclick={removePost}>
									<Icon icon="mdi:trash-can-outline" class="size-4" />
									删除
								</Button>
							{/if}
						</div>
					</div>
					{#if editing}
						<div class="space-y-3">
							<div class="space-y-2">
								<Label for="edit-title">标题</Label>
								<Input id="edit-title" bind:value={editTitle} placeholder="帖子标题" />
							</div>
							<div class="space-y-2">
								<Label for="edit-category">分类</Label>
								<Select
									type="single"
									value={editCategoryId}
									onValueChange={(v) => (editCategoryId = v ?? '')}
								>
									<SelectTrigger class="w-48" id="edit-category">
										{categories.find((c) => c.id === editCategoryId)?.name || '未分类'}
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">未分类</SelectItem>
										{#each categories as item (item.id)}
											<SelectItem value={item.id}>{item.name}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>
						</div>
					{:else}
						<h1 class="text-3xl font-bold leading-tight">{post.title}</h1>
					{/if}
				</div>

				{#if editing}
					<div class="space-y-3">
						<ForumMarkdownEditor
							bind:value={editContent}
							mode="post"
							uploadType="post"
							uploadPostId={post.id}
							placeholder="支持 Markdown，Ctrl/Cmd + Enter 保存"
							submitting={editSubmitting}
							minHeight={520}
							onsubmit={saveEdit}
							onescape={cancelEdit}
						/>
						<div class="flex items-center justify-end gap-2">
							<Button variant="outline" onclick={cancelEdit} disabled={editSubmitting}>
								<Icon icon="mdi:close" class="size-4" />
								取消
							</Button>
							<Button onclick={saveEdit} disabled={editSubmitting || !editTitle.trim() || !editContent.trim()}>
								{#if editSubmitting}
									<Icon icon="mdi:loading" class="size-4 animate-spin" />
								{:else}
									<Icon icon="mdi:content-save-outline" class="size-4" />
								{/if}
								保存
							</Button>
						</div>
					</div>
				{:else}
					<ForumMarkdownContent content={post.content || post.excerpt || ''} />
				{/if}
			</Card>
		</article>

		<Card class="p-4 md:p-5 space-y-4">
			<div class="flex items-center justify-between border-b pb-3">
				<h2 class="flex items-center gap-2 text-lg font-bold">
					<Icon icon="mdi:comment-multiple-outline" class="size-5 text-primary" />
					评论
					<Badge variant="secondary">{commentCount}</Badge>
				</h2>
				<Select
					type="single"
					value={commentSort}
					onValueChange={(v) => changeCommentSort(v ?? 'hot')}
				>
					<SelectTrigger class="w-28">{sortLabels[commentSort] || '最热'}</SelectTrigger>
					<SelectContent>
						{#each Object.entries(sortLabels) as [k, v] (k)}
							<SelectItem value={k}>{v}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			{#if $forumAuth.token}
				{#if composerExpanded}
					<div class="space-y-3">
						<ForumMarkdownEditor
							bind:value={commentDraft}
							mode="comment"
							uploadType="comment"
							uploadPostId={postId}
							placeholder="支持 Markdown，Ctrl/Cmd + Enter 提交"
							submitting={commentSubmitting}
							minHeight={420}
							autoFocus
							onsubmit={submitComment}
							onescape={cancelCompose}
						/>
						<div class="flex items-center justify-end gap-2">
							<span class="text-xs text-muted-foreground">Ctrl/Cmd + Enter 提交</span>
							<Button variant="outline" onclick={cancelCompose} disabled={commentSubmitting}>
								<Icon icon="mdi:close" class="size-4" />
								取消
							</Button>
							<Button onclick={submitComment} disabled={commentSubmitting || !commentDraft.trim()}>
								{#if commentSubmitting}
									<Icon icon="mdi:loading" class="size-4 animate-spin" />
								{:else}
									<Icon icon="mdi:send" class="size-4" />
								{/if}
								发表
							</Button>
						</div>
					</div>
				{:else}
					<button
						type="button"
						class="flex w-full items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted/60"
						onclick={() => (composerExpanded = true)}
					>
						<Icon icon="mdi:comment-edit-outline" class="size-4 text-primary" />
						撰写评论...
					</button>
				{/if}
			{:else}
				<Alert>
					<Icon icon="mdi:information-outline" />
					<AlertDescription class="flex flex-wrap items-center gap-2">
						<span>登录后即可发表评论。</span>
						<a
							href="/forum/auth/login/"
							class="text-primary underline decoration-dashed underline-offset-4"
						>
							去登录
						</a>
					</AlertDescription>
				</Alert>
			{/if}

			{#if commentsLoading}
				<div class="space-y-3">
					{#each Array(3) as _, i (i)}
						<div class="space-y-2">
							<div class="h-4 w-32 rounded bg-muted"></div>
							<div class="h-4 w-full rounded bg-muted/70"></div>
							<div class="h-4 w-3/4 rounded bg-muted/70"></div>
						</div>
					{/each}
				</div>
			{:else if comments.length === 0}
				<p class="py-6 text-center text-sm text-muted-foreground">还没有评论，沙发就是你的了。</p>
			{:else}
				<div class="space-y-4">
					{#each comments as comment (comment.id)}
						<CommentItem {comment} depth={0} onDeleted={loadComments} />
					{/each}
				</div>
			{/if}
		</Card>
	{/if}
</div>
