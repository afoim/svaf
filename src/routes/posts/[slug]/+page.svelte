<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import ImageViewer from '$lib/components/ImageViewer.svelte';
	import Giscus from '$lib/components/Giscus.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	
	let pageViews = $state<number | null>(null);

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	async function loadPageViews() {
		try {
			const response = await fetch('https://t.2x.nz/batch', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				body: JSON.stringify([`/posts/${data.slug}/`])
			});
			
			if (response.ok) {
				const views = await response.json() as number[];
				pageViews = views[0] || 0;
			}
		} catch (error) {
			console.error('Failed to load page views:', error);
		}
	}
	
	onMount(() => {
		loadPageViews();
	});
</script>

<svelte:head>
	<title>{data.post.metadata.title} - {siteConfig.title}</title>
	<meta name="description" content={data.post.metadata.description} />
	<meta property="og:title" content={data.post.metadata.title} />
	<meta property="og:description" content={data.post.metadata.description} />
	{#if data.post.metadata.image}
		<meta property="og:image" content={data.post.metadata.image} />
	{/if}
</svelte:head>

<article class="container mx-auto max-w-3xl px-4 py-12">
	<!-- 返回按钮 -->
	<div class="mb-8">
		<a href="/posts">
			<Button variant="ghost">← 返回文章列表</Button>
		</a>
	</div>

	<!-- 文章头部 -->
	<header class="mb-8">
		<div class="mb-4 flex items-center gap-2">
			{#if data.post.metadata.pinned}
				<span class="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
					置顶
				</span>
			{/if}
			<time class="text-sm text-muted-foreground">
				{formatDate(data.post.metadata.published)}
			</time>
			{#if pageViews !== null}
				<span class="text-sm text-muted-foreground">·</span>
				<span class="text-sm text-muted-foreground">{pageViews.toLocaleString()} 次浏览</span>
			{/if}
		</div>

		<h1 class="mb-4 text-4xl font-bold">{data.post.metadata.title}</h1>
		
		<p class="text-lg text-muted-foreground">
			{data.post.metadata.description}
		</p>

		{#if data.post.metadata.image}
			<div class="mt-6">
				<img
					src={data.post.metadata.image}
					alt={data.post.metadata.title}
					class="w-full rounded-lg object-cover"
				/>
			</div>
		{/if}
	</header>

	<!-- 文章内容 - 使用 mdsvex 组件 -->
	<div class="prose prose-neutral dark:prose-invert max-w-none">
		<data.component />
	</div>

	<!-- 评论区 -->
	<Giscus />

	<!-- 文章底部 -->
	<footer class="mt-12 border-t pt-8">
		<div class="flex justify-center">
			<a href="/posts">
				<Button>← 返回文章列表</Button>
			</a>
		</div>
	</footer>
</article>

<!-- 图片查看器 -->
<ImageViewer />

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
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 0.875rem;
	}

	:global(.prose pre) {
		margin-bottom: 1rem;
		overflow-x: auto;
		border-radius: 0.5rem;
		padding: 1rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
	}

	:global(.prose pre code) {
		background-color: transparent;
		padding: 0;
		font-size: 0.875rem;
		line-height: 1.7;
		font-family: inherit;
	}
	
	/* rehype-pretty-code 使用 CSS 变量实现主题切换 */
	:global(.prose pre) {
		background-color: var(--shiki-light-bg);
		color: var(--shiki-light);
	}
	
	@media (prefers-color-scheme: dark) {
		:global(.prose pre) {
			background-color: var(--shiki-dark-bg);
			color: var(--shiki-dark);
		}
	}
	
	/* 应用 shiki 的颜色变量到每个 span */
	:global(.prose pre span) {
		color: var(--shiki-light);
	}
	
	@media (prefers-color-scheme: dark) {
		:global(.prose pre span) {
			color: var(--shiki-dark);
		}
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
