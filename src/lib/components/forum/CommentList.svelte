<script lang="ts">
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { ForumComment } from '$lib/forum/types/comment';
	import { formatForumDateTime } from '$lib/forum/utils/markdown';
	import ForumMarkdownContent from './ForumMarkdownContent.svelte';
	import CommentItem from './CommentItem.svelte';

	let {
		comments = [],
		loading = false,
		onDeleted
	}: {
		comments?: ForumComment[];
		loading?: boolean;
		onDeleted?: () => void;
	} = $props();

	let count = $derived.by(() => {
		const walk = (list: ForumComment[]): number =>
			list.reduce((acc, c) => acc + 1 + (c.replies ? walk(c.replies) : 0), 0);
		return walk(comments);
	});
</script>

<Card class="p-4 md:p-5 space-y-4">
	<div class="flex items-center justify-between border-b pb-3">
		<h2 class="flex items-center gap-2 text-lg font-bold">
			<Icon icon="mdi:comment-multiple-outline" class="size-5 text-primary" />
			评论
			<Badge variant="secondary">{count}</Badge>
		</h2>
	</div>

	{#if loading}
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
				<CommentItem {comment} depth={0} {onDeleted} />
			{/each}
		</div>
	{/if}
</Card>
