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
	import CommentList from '$lib/components/forum/CommentList.svelte';
	import { getPost } from '$lib/forum/api/posts';
	import {
		buildCommentTree,
		createComment,
		getComments,
		type CommentListQuery
	} from '$lib/forum/api/comments';
	import { ForumApiError } from '$lib/forum/types/api';
	import type { ForumPostDetail } from '$lib/forum/types/post';
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
			emitSuccessToast('评论', '评论已发表。');
			await loadComments();
		} catch (e) {
			emitErrorToast('评论', e instanceof Error ? e.message : '评论失败，请稍后再试。');
		} finally {
			commentSubmitting = false;
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
						</div>
					</div>
					<h1 class="text-3xl font-bold leading-tight">{post.title}</h1>
				</div>

				<ForumMarkdownContent content={post.content || post.excerpt || ''} />
			</Card>
		</article>

		<section class="space-y-3">
			<div class="flex items-center justify-between">
				<h2 class="text-sm text-muted-foreground">评论排序</h2>
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
				<Card class="p-4 md:p-5 space-y-3">
					<div class="flex items-center gap-2 text-sm font-medium">
						<Icon icon="mdi:comment-edit-outline" class="size-4 text-primary" />
						发表评论
					</div>
					<ForumMarkdownEditor
						bind:value={commentDraft}
						mode="comment"
						uploadType="comment"
						uploadPostId={postId}
						placeholder="支持 Markdown，Ctrl/Cmd + Enter 提交"
						submitting={commentSubmitting}
						onsubmit={submitComment}
					/>
					<div class="flex items-center justify-end gap-2">
						<span class="text-xs text-muted-foreground">Ctrl/Cmd + Enter 提交</span>
						<Button onclick={submitComment} disabled={commentSubmitting || !commentDraft.trim()}>
							{#if commentSubmitting}
								<Icon icon="mdi:loading" class="size-4 animate-spin" />
							{:else}
								<Icon icon="mdi:send" class="size-4" />
							{/if}
							发表
						</Button>
					</div>
				</Card>
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

			<CommentList {comments} loading={commentsLoading} />
		</section>
	{/if}
</div>
