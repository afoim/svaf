<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { post, component } = data;

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

	<!-- 文章内容 - 使用 mdsvex 组件 -->
	<div class="prose prose-neutral dark:prose-invert max-w-none">
		<svelte:component this={component} />
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
	@import "tailwindcss";
	
	/* Markdown 样式 */
	:global(.prose) {
		color: var(--foreground);
	}

	:global(.prose h1) {
		margin-bottom: 1rem;
		margin-top: 2rem;
		font-size: 1.875rem;
		font-weight: 700;
	}

	:global(.prose h2) {
		margin-bottom: 0.75rem;
		margin-top: 1.5rem;
		font-size: 1.5rem;
		font-weight: 600;
	}

	:global(.prose h3) {
		margin-bottom: 0.5rem;
		margin-top: 1rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	:global(.prose p) {
		margin-bottom: 1rem;
		line-height: 1.75;
	}

	:global(.prose a) {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	:global(.prose a:hover) {
		opacity: 0.8;
	}

	:global(.prose ul),
	:global(.prose ol) {
		margin-bottom: 1rem;
		margin-left: 1.5rem;
	}

	:global(.prose li) {
		margin-bottom: 0.5rem;
	}

	:global(.prose blockquote) {
		border-left: 4px solid var(--primary);
		padding-left: 1rem;
		font-style: italic;
		color: var(--muted-foreground);
	}

	:global(.prose code) {
		border-radius: 0.25rem;
		background-color: var(--muted);
		padding: 0.125rem 0.375rem;
		font-family: monospace;
		font-size: 0.875rem;
	}

	:global(.prose pre) {
		margin-bottom: 1rem;
		overflow-x: auto;
		border-radius: 0.5rem;
		background-color: var(--muted);
		padding: 1rem;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
	}

	:global(.prose img) {
		margin-top: 1rem;
		margin-bottom: 1rem;
		border-radius: 0.5rem;
	}

	:global(.prose hr) {
		margin-top: 2rem;
		margin-bottom: 2rem;
		border-color: var(--border);
	}

	:global(.prose table) {
		width: 100%;
		border-collapse: collapse;
	}

	:global(.prose th),
	:global(.prose td) {
		border: 1px solid var(--border);
		padding: 0.5rem 1rem;
	}

	:global(.prose th) {
		background-color: var(--muted);
		font-weight: 600;
	}
</style>
