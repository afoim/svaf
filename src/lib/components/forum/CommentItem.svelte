<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';
	import type { ForumComment } from '$lib/forum/types/comment';
	import { formatForumDateTime } from '$lib/forum/utils/markdown';
	import ForumMarkdownContent from './ForumMarkdownContent.svelte';
	import Self from './CommentItem.svelte';

	let {
		comment,
		depth = 0
	}: {
		comment: ForumComment;
		depth?: number;
	} = $props();

	function goToUser(id?: string) {
		if (!id) return;
		goto(`/forum/u?id=${encodeURIComponent(id)}`);
	}
</script>

<div
	class="rounded-lg border bg-muted/20 p-4"
	style="margin-left: {Math.min(depth, 4) * 16}px;"
>
	<div class="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
		{#if comment.isPinned}
			<Badge variant="default" class="gap-1">
				<Icon icon="mdi:pin" class="size-3" />
				置顶
			</Badge>
		{/if}
		{#if comment.author?.id}
			<button
				type="button"
				class="flex items-center gap-2 rounded-md hover:text-primary"
				onclick={() => goToUser(comment.author?.id)}
			>
				{#if comment.author.avatarUrl}
					<img
						src={comment.author.avatarUrl}
						alt={comment.author.displayName || comment.author.username}
						class="size-6 rounded-full object-cover"
						loading="lazy"
						referrerpolicy="no-referrer"
					/>
				{:else}
					<span class="flex size-6 items-center justify-center rounded-full bg-muted">
						<Icon icon="mdi:account" class="size-4" />
					</span>
				{/if}
				<span class="font-medium text-foreground">
					{comment.author.displayName || comment.author.username}
				</span>
			</button>
		{:else}
			<span class="text-foreground">{comment.author?.username || '匿名用户'}</span>
		{/if}
		<span>·</span>
		<span>{formatForumDateTime(comment.updatedAt || comment.createdAt)}</span>
	</div>

	<ForumMarkdownContent content={comment.content} />

	<div class="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
		<span class="flex items-center gap-1">
			<Icon
				icon={comment.liked ? 'mdi:heart' : 'mdi:heart-outline'}
				class="size-4 {comment.liked ? 'text-primary' : ''}"
			/>
			{comment.likeCount || 0}
		</span>
	</div>

	{#if comment.replies && comment.replies.length > 0}
		<div class="mt-4 space-y-3">
			{#each comment.replies as reply (reply.id)}
				<Self comment={reply} depth={depth + 1} />
			{/each}
		</div>
	{/if}
</div>
