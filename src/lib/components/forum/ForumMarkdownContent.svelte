<script lang="ts">
	import { renderForumMarkdown, renderForumMarkdownAsync } from '$lib/forum/utils/markdown';

	let { content = '' }: { content?: string } = $props();

	// 先用同步版本立刻渲染（无代码高亮，纯 escape），再异步替换为带 shiki 高亮的版本
	let html = $state('');

	$effect(() => {
		const text = content;
		html = renderForumMarkdown(text);
		let cancelled = false;
		renderForumMarkdownAsync(text).then((next) => {
			if (!cancelled) html = next;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<div
	class="prose prose-neutral dark:prose-invert max-w-none
		prose-headings:text-foreground
		prose-p:text-foreground
		prose-strong:text-foreground
		prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80
		prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
		prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none
		prose-hr:border-border
		prose-th:border prose-th:border-border prose-th:bg-muted
		prose-td:border prose-td:border-border
		prose-img:rounded-lg"
>
	{@html html}
</div>
