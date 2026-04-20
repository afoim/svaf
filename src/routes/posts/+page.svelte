<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { posts } = data;

	let searchQuery = $state('');
	let allPosts = $state<Array<{ title: string; link: string; description: string; date: string; content: string }>>([]);
	let isLoading = $state(false);
	let hasLoaded = $state(false);
	
	let searchFilters = $state({
		title: true,
		description: true,
		content: true,
		path: true
	});

	async function loadRSS() {
		if (hasLoaded) return;
		
		isLoading = true;
		try {
			const response = await fetch('/rss.xml');
			const text = await response.text();
			const parser = new DOMParser();
			const xml = parser.parseFromString(text, 'text/xml');
			const items = xml.querySelectorAll('item');
			
			allPosts = Array.from(items).map(item => ({
				title: item.querySelector('title')?.textContent || '',
				link: item.querySelector('link')?.textContent || '',
				description: item.querySelector('description')?.textContent || '',
				date: item.querySelector('pubDate')?.textContent || '',
				content: item.querySelector('content\\:encoded, encoded')?.textContent || ''
			}));
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

	let filteredPostsWithMatches = $derived(() => {
		if (!searchQuery.trim()) return posts.map(p => ({ post: p, matchedLines: [] }));
		
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
	<title>文章列表 - {siteConfig.title}</title>
	<meta name="description" content="浏览所有文章" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold">文章列表</h1>
		<p class="text-muted-foreground">分享技术、想法和经验</p>
	</div>

	<div class="mb-8">
		<input
			type="text"
			bind:value={searchQuery}
			onfocus={loadRSS}
			placeholder="搜索文章标题、描述或内容..."
			class="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		/>
		
		<div class="mt-3 flex flex-wrap gap-2">
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={searchFilters.title}
					class="h-4 w-4 rounded border-input"
				/>
				<span class="text-sm">标题</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={searchFilters.description}
					class="h-4 w-4 rounded border-input"
				/>
				<span class="text-sm">简介</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={searchFilters.content}
					class="h-4 w-4 rounded border-input"
				/>
				<span class="text-sm">正文</span>
			</label>
			<label class="flex items-center gap-2 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={searchFilters.path}
					class="h-4 w-4 rounded border-input"
				/>
				<span class="text-sm">路径</span>
			</label>
		</div>
		
		{#if searchQuery}
			<div class="mt-2 min-h-[20px]">
				{#if isLoading}
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

	<div class="mt-12 text-center">
		<a href="/">
			<Button variant="outline">返回首页</Button>
		</a>
	</div>
</div>
