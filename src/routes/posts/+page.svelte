<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { siteConfig } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { posts } = data;

	let searchQuery = $state('');
	let allPosts = $state<Array<{ title: string; link: string; description: string; date: string; content: string; wordCount: number; readTime: number }>>([]);
	let isLoading = $state(false);
	let hasLoaded = $state(false);
	
	let searchFilters = $state({
		title: true,
		description: true,
		content: true,
		path: true
	});

	function calculateWordCount(text: string): number {
		// 移除 HTML 标签
		const plainText = text.replace(/<[^>]*>/g, '');
		// 计算中文字符
		const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) || [];
		// 计算英文单词
		const englishWords = plainText.match(/[a-zA-Z]+/g) || [];
		return chineseChars.length + englishWords.length;
	}

	function calculateReadTime(wordCount: number): number {
		// 假设每分钟阅读 300 字
		return Math.ceil(wordCount / 300);
	}

	async function loadRSS() {
		if (hasLoaded) return;
		
		isLoading = true;
		try {
			const response = await fetch('/rss.xml');
			const text = await response.text();
			const parser = new DOMParser();
			const xml = parser.parseFromString(text, 'text/xml');
			const items = xml.querySelectorAll('item');
			
			allPosts = Array.from(items).map(item => {
				const content = item.querySelector('content\\:encoded, encoded')?.textContent || '';
				const wordCount = calculateWordCount(content);
				const readTime = calculateReadTime(wordCount);
				
				return {
					title: item.querySelector('title')?.textContent || '',
					link: item.querySelector('link')?.textContent || '',
					description: item.querySelector('description')?.textContent || '',
					date: item.querySelector('pubDate')?.textContent || '',
					content,
					wordCount,
					readTime
				};
			});
			hasLoaded = true;
		} catch (error) {
			console.error('Failed to load RSS:', error);
		} finally {
			isLoading = false;
		}
	}

	function highlightText(text: string, query: string): string {
		if (!query.trim()) return text;
		const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
	}

	function getMatchedContentLines(content: string, query: string): string[] {
		if (!query.trim()) return [];
		const lines = content.split('\n');
		const queryLower = query.toLowerCase();
		const matched: string[] = [];
		
		for (const line of lines) {
			if (line.toLowerCase().includes(queryLower)) {
				const trimmed = line.trim();
				if (trimmed && !trimmed.startsWith('#') && trimmed.length > 10) {
					matched.push(trimmed);
					if (matched.length >= 3) break;
				}
			}
		}
		
		return matched;
	}

	function getPostStats(slug: string): { wordCount: number; readTime: number } | null {
		const rssPost = allPosts.find(rss => rss.link.includes(slug));
		return rssPost ? { wordCount: rssPost.wordCount, readTime: rssPost.readTime } : null;
	}

	let filteredPostsWithMatches = $derived(() => {
		if (!searchQuery.trim()) return posts.map(p => ({ post: p, matchedLines: [] }));
		
		// 检查是否至少选择了一个过滤器
		const hasAnyFilter = searchFilters.title || searchFilters.description || searchFilters.content || searchFilters.path;
		if (!hasAnyFilter) return [];
		
		const query = searchQuery.toLowerCase();
		const results: Array<{ post: typeof posts[0], matchedLines: string[] }> = [];
		
		for (const post of posts) {
			const rssPost = allPosts.find(rss => rss.link.includes(post.slug));
			if (!rssPost) continue;
			
			const titleMatch = searchFilters.title && rssPost.title.toLowerCase().includes(query);
			const descMatch = searchFilters.description && rssPost.description.toLowerCase().includes(query);
			const contentMatch = searchFilters.content && rssPost.content.toLowerCase().includes(query);
			const pathMatch = searchFilters.path && post.slug.toLowerCase().includes(query);
			
			if (titleMatch || descMatch || contentMatch || pathMatch) {
				const matchedLines = contentMatch && !titleMatch && !descMatch && !pathMatch
					? getMatchedContentLines(rssPost.content, query)
					: [];
				results.push({ post, matchedLines });
			}
		}
		
		return results;
	});
	
	let hasAnyFilter = $derived(searchFilters.title || searchFilters.description || searchFilters.content || searchFilters.path);
	
	let totalStats = $derived(() => {
		if (!hasLoaded) return { totalPosts: posts.length, totalWords: 0 };
		const totalWords = allPosts.reduce((sum, post) => sum + post.wordCount, 0);
		return { totalPosts: posts.length, totalWords };
	});

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	// 页面加载时自动加载 RSS 以获取字数统计
	import { onMount } from 'svelte';
	onMount(() => {
		loadRSS();
	});
</script>

<svelte:head>
	<title>文章列表 - {siteConfig.title}</title>
	<meta name="description" content="浏览所有文章" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold">文章列表</h1>
		<p class="text-muted-foreground">分享技术、想法和经验</p>
		{#if hasLoaded}
			<p class="mt-2 text-sm text-muted-foreground">
				共 {totalStats().totalPosts} 篇文章 · 总计 {totalStats().totalWords.toLocaleString()} 字
			</p>
		{/if}
	</div>

	<div class="mb-8">
		<Input
			type="text"
			bind:value={searchQuery}
			onfocus={loadRSS}
			placeholder="搜索文章标题、描述或内容..."
			class="w-full"
		/>
		
		<div class="mt-3 flex flex-wrap gap-4">
			<label class="flex items-center gap-2 cursor-pointer">
				<Checkbox bind:checked={searchFilters.title} />
				<span class="text-sm">标题</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer">
				<Checkbox bind:checked={searchFilters.description} />
				<span class="text-sm">简介</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer">
				<Checkbox bind:checked={searchFilters.content} />
				<span class="text-sm">正文</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer">
				<Checkbox bind:checked={searchFilters.path} />
				<span class="text-sm">路径</span>
			</label>
		</div>
		
		{#if searchQuery}
			<div class="mt-2 min-h-[20px]">
				{#if !hasAnyFilter}
					<p class="text-sm text-red-500">你什么都不选怎么搜啊喂！</p>
				{:else if isLoading}
					<p class="text-sm text-muted-foreground">搜索中...</p>
				{:else if filteredPostsWithMatches().length === 0}
					<p class="text-sm text-muted-foreground">未找到匹配的文章</p>
				{:else}
					<p class="text-sm text-muted-foreground">找到 {filteredPostsWithMatches().length} 篇文章</p>
				{/if}
			</div>
		{/if}
	</div>

	<div class="space-y-6">
		{#each filteredPostsWithMatches() as { post, matchedLines }}
			<article class="group relative overflow-hidden rounded-lg bg-card transition-all hover:shadow-lg" style="border: 1px solid rgba(0,0,0,0.1);">
				<a href="/posts/{post.slug}" class="block">
					<div class="flex flex-col gap-4 p-6 md:flex-row">
						{#if post.metadata.image}
							<div class="md:w-48 md:flex-shrink-0">
								<img
									src={post.metadata.image}
									alt={post.metadata.title}
									class="h-48 w-full rounded-md object-cover md:h-32"
								/>
							</div>
						{/if}
						
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-2">
								{#if post.metadata.pinned}
									<span class="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
										置顶
									</span>
								{/if}
								<time class="text-sm text-muted-foreground">
									{formatDate(post.metadata.published)}
								</time>
								{#if hasLoaded}
									{@const stats = getPostStats(post.slug)}
									{#if stats}
										<span class="text-sm text-muted-foreground">·</span>
										<span class="text-sm text-muted-foreground">{stats.wordCount} 字</span>
										<span class="text-sm text-muted-foreground">·</span>
										<span class="text-sm text-muted-foreground">约 {stats.readTime} 分钟</span>
									{/if}
								{/if}
							</div>
							
							<h2 class="mb-2 text-2xl font-semibold group-hover:text-primary">
								{@html highlightText(post.metadata.title, searchQuery)}
							</h2>
							
							<p class="text-muted-foreground">
								{@html highlightText(post.metadata.description, searchQuery)}
							</p>
							
							{#if matchedLines.length > 0}
								<div class="mt-3 space-y-1 border-l-2 border-primary/30 pl-3">
									{#each matchedLines as line}
										<p class="text-sm text-muted-foreground">
											{@html highlightText(line, searchQuery)}
										</p>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</a>
			</article>
		{/each}
	</div>

	{#if filteredPostsWithMatches().length === 0 && !searchQuery}
		<div class="py-12 text-center">
			<p class="text-muted-foreground">暂无文章</p>
		</div>
	{/if}
</div>
