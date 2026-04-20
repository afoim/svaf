<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { post, html } = data;

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{post.metadata.title} - {siteConfig.name}</title>
	<meta name="description" content={post.metadata.description} />
	<meta property="og:title" content={post.metadata.title} />
	<meta property="og:description" content={post.metadata.description} />
	{#if post.metadata.image}
		<meta property="og:image" content={post.metadata.image} />
	{/if}
</svelte:head>

<article class="container mx-auto max-w-3xl px-4 py-12">
	<!-- 返回按钮 -->
	<div class="mb-8">
		<Button variant="ghost" onclick={() => window.history.back()}>
			← 返回博客列表
		</Button>
	</div>

	<!-- 文章头部 -->
	<header class="mb-8">
		<div class="mb-4 flex items-center gap-2">
			{#if post.metadata.pinned}
				<span class="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
					置顶
				</span>
			{/if}
			<time class="text-sm text-muted-foreground">
				{formatDate(post.metadata.published)}
			</time>
		</div>

		<h1 class="mb-4 text-4xl font-bold">{post.metadata.title}</h1>
		
		<p class="text-lg text-muted-foreground">
			{post.metadata.description}
		</p>

		{#if post.metadata.image}
			<div class="mt-6">
				<img
					src={post.metadata.image}
					alt={post.metadata.title}
					class="w-full rounded-lg object-cover"
				/>
			</div>
		{/if}
	</header>

	<!-- 文章内容 -->
	<div class="prose prose-neutral dark:prose-invert max-w-none">
		{@html html}
	</div>

	<!-- 文章底部 -->
	<footer class="mt-12 border-t pt-8">
		<div class="flex justify-center">
			<Button onclick={() => window.history.back()}>
				← 返回博客列表
			</Button>
		</div>
	</footer>
</article>

<style>
	/* Markdown 样式 */
	:global(.prose) {
		@apply text-foreground;
	}

	:global(.prose h1) {
		@apply mb-4 mt-8 text-3xl font-bold;
	}

	:global(.prose h2) {
		@apply mb-3 mt-6 text-2xl font-semibold;
	}

	:global(.prose h3) {
		@apply mb-2 mt-4 text-xl font-semibold;
	}

	:global(.prose p) {
		@apply mb-4 leading-7;
	}

	:global(.prose a) {
		@apply text-primary underline underline-offset-4 hover:text-primary/80;
	}

	:global(.prose ul),
	:global(.prose ol) {
		@apply mb-4 ml-6;
	}

	:global(.prose li) {
		@apply mb-2;
	}

	:global(.prose blockquote) {
		@apply border-l-4 border-primary pl-4 italic text-muted-foreground;
	}

	:global(.prose code) {
		@apply rounded bg-muted px-1.5 py-0.5 font-mono text-sm;
	}

	:global(.prose pre) {
		@apply mb-4 overflow-x-auto rounded-lg bg-muted p-4;
	}

	:global(.prose pre code) {
		@apply bg-transparent p-0;
	}

	:global(.prose img) {
		@apply my-4 rounded-lg;
	}

	:global(.prose hr) {
		@apply my-8 border-border;
	}

	:global(.prose table) {
		@apply w-full border-collapse;
	}

	:global(.prose th),
	:global(.prose td) {
		@apply border border-border px-4 py-2;
	}

	:global(.prose th) {
		@apply bg-muted font-semibold;
	}
</style>
