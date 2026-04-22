<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';
	import type { ForumPostSummary } from '$lib/forum/types/post';
	import { formatForumDateTime } from '$lib/forum/utils/markdown';

	let {
		posts = [],
		loading = false,
		emptyText = '暂无帖子'
	}: {
		posts?: ForumPostSummary[] | null;
		loading?: boolean;
		emptyText?: string;
	} = $props();

	let safePosts = $derived(Array.isArray(posts) ? posts : []);

	function goToPost(id: string) {
		goto(`/forum/post?id=${encodeURIComponent(id)}`);
	}
	function goToUser(id: string | undefined, e?: MouseEvent | KeyboardEvent) {
		e?.stopPropagation();
		if (!id) return;
		goto(`/forum/u?id=${encodeURIComponent(id)}`);
	}
</script>

<div class="space-y-4">
	{#if loading}
		{#each Array(3) as _, i (i)}
			<Card class="p-5 space-y-4">
				<div class="flex items-start justify-between gap-4">
					<div class="flex-1 space-y-2">
						<div class="h-6 w-48 rounded bg-muted"></div>
						<div class="h-4 w-full rounded bg-muted/70"></div>
						<div class="h-4 w-3/4 rounded bg-muted/70"></div>
					</div>
					<div class="h-6 w-16 rounded-full bg-muted/70"></div>
				</div>
				<div class="h-40 w-full rounded-xl bg-muted/50"></div>
				<div class="flex items-center gap-3">
					<div class="size-9 rounded-full bg-muted/70"></div>
					<div class="flex-1 space-y-1">
						<div class="h-4 w-24 rounded bg-muted/70"></div>
						<div class="h-3 w-32 rounded bg-muted/50"></div>
					</div>
				</div>
				<div class="flex items-center gap-4">
					<div class="h-4 w-16 rounded bg-muted/50"></div>
					<div class="h-4 w-16 rounded bg-muted/50"></div>
					<div class="h-4 w-16 rounded bg-muted/50"></div>
				</div>
			</Card>
		{/each}
	{:else if safePosts.length === 0}
		<Card class="p-5 text-muted-foreground">{emptyText}</Card>
	{:else}
		{#each safePosts as post (post.id)}
			<Card
				class="group p-5 cursor-pointer transition-colors hover:bg-accent/30"
				role="link"
				tabindex={0}
				onclick={() => goToPost(post.id)}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goToPost(post.id)}
			>
				<div class="mb-4 flex items-start justify-between gap-4">
					<div class="flex-1 min-w-0">
						<div class="mb-2 flex flex-wrap items-center gap-2">
							{#if post.isPinned}
								<Badge variant="default" class="gap-1">
									<Icon icon="mdi:pin" class="size-3.5" />
									置顶
								</Badge>
							{/if}
							<h2 class="text-lg font-bold group-hover:text-primary">{post.title}</h2>
						</div>
						{#if post.excerpt}
							<p class="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
						{/if}
					</div>
					{#if post.category?.name}
						<Badge variant="secondary" class="shrink-0">{post.category.name}</Badge>
					{/if}
				</div>

				{#if post.coverImageUrl}
					<div class="mb-4 overflow-hidden rounded-xl border bg-muted">
						<img
							src={post.coverImageUrl}
							alt="{post.title} 封面"
							loading="lazy"
							class="h-48 w-full object-cover transition-transform group-hover:scale-[1.02]"
						/>
					</div>
				{/if}

				<div class="mb-4 flex items-center gap-3 text-sm">
					{#if post.authorId}
						<button
							type="button"
							class="flex items-center gap-3 rounded-md text-left hover:text-primary"
							onclick={(e) => goToUser(post.authorId, e)}
						>
							{#if post.author?.avatarUrl}
								<img
									src={post.author.avatarUrl}
									alt={post.author.displayName || post.author.username}
									referrerpolicy="no-referrer"
									loading="lazy"
									class="size-9 rounded-full object-cover"
								/>
							{:else}
								<span class="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
									<Icon icon="mdi:account" class="size-5" />
								</span>
							{/if}
							<div class="min-w-0">
								<div class="truncate font-medium">
									{post.author?.displayName || post.author?.username || '匿名用户'}
								</div>
								<div class="text-xs text-muted-foreground">
									{formatForumDateTime(post.updatedAt || post.createdAt)}
								</div>
							</div>
						</button>
					{:else}
						<div class="flex items-center gap-3">
							{#if post.author?.avatarUrl}
								<img
									src={post.author.avatarUrl}
									alt={post.author.displayName || post.author.username}
									referrerpolicy="no-referrer"
									loading="lazy"
									class="size-9 rounded-full object-cover"
								/>
							{:else}
								<span class="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
									<Icon icon="mdi:account" class="size-5" />
								</span>
							{/if}
							<div>
								<div class="font-medium">
									{post.author?.displayName || post.author?.username || '匿名用户'}
								</div>
								<div class="text-xs text-muted-foreground">
									{formatForumDateTime(post.updatedAt || post.createdAt)}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
					<span class="flex items-center gap-1">
						<Icon icon="mdi:eye-outline" class="size-4" />
						{post.viewCount || 0}
					</span>
					<span class="flex items-center gap-1">
						<Icon icon="mdi:comment-outline" class="size-4" />
						{post.commentCount || 0}
					</span>
					<span class="flex items-center gap-1">
						<Icon icon="mdi:heart-outline" class="size-4" />
						{post.likeCount || 0}
					</span>
				</div>
			</Card>
		{/each}
	{/if}
</div>
