<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { siteConfig } from '$lib/config/site';
	import ImageViewer from '$lib/components/ImageViewer.svelte';
	import Giscus from '$lib/components/Giscus.svelte';
	import PageViews from '$lib/components/PageViews.svelte';
	import MermaidRenderer from '$lib/components/MermaidRenderer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
				<Badge>置顶</Badge>
			{/if}
			<time class="text-sm text-muted-foreground">
				{formatDate(data.post.metadata.published)}
			</time>
			<span class="text-sm text-muted-foreground">·</span>
			<PageViews
				pathname="/posts/{data.slug}/"
				cacheKey="post-pageviews-{data.slug}"
				class="text-sm text-muted-foreground"
			/>
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
	<div
		class="prose prose-neutral dark:prose-invert max-w-none
			prose-headings:text-foreground
			prose-p:text-foreground
			prose-strong:text-foreground
			prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80
			prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
			prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none
			prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-foreground
			prose-hr:border-border
			prose-th:border prose-th:border-border prose-th:bg-muted
			prose-td:border prose-td:border-border
			prose-img:rounded-lg"
	>
		<data.component />
	</div>

	<MermaidRenderer />

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
