<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { posts } = data;

	let searchQuery = $state('');
	let allPosts = $state<Array<{ title: string; link: string; description: string; date: string; content: string }>>([]);
	let isLoading = $state(false);

	async function loadRSS() {
		if (allPosts.length > 0) return;
		
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
		} catch (error) {
			console.error('Failed to load RSS:', error);
		} finally {
			isLoading = false;
		}
	}

	let filteredPosts = $derived(() => {
		if (!searchQuery.trim()) return posts;
		
		const query = searchQuery.toLowerCase();
		const rssResults = allPosts.filter(post => 
			post.title.toLowerCase().includes(query) ||
			post.description.toLowerCase().includes(query) ||
			post.content.toLowerCase().includes(query)
		);
		
		return posts.filter(post => 
			rssResults.some(rss => rss.link.includes(post.slug))
		);
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
		<div class="mt-2 min-h-[20px]">
			{#if isLoading}
				<p class="text-sm text-muted-foreground">加载搜索数据中...</p>
			{:else if searchQuery && filteredPosts().length === 0}
				<p class="text-sm text-muted-foreground">未找到匹配的文章</p>
			{/if}
		</div>
	</div>

	<div class="space-y-6">
		{#each filteredPosts() as post}
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
								{post.metadata.title}
							</h2>
							
							<p class="text-muted-foreground">
								{post.metadata.description}
							</p>
						</div>
					</div>
				</a>
			</article>
		{/each}
	</div>

	{#if filteredPosts().length === 0 && !searchQuery}
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
