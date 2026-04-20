<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { posts } = data;

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
	<title>博客 - {siteConfig.name}</title>
	<meta name="description" content="浏览所有文章" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<div class="mb-12 text-center">
		<h1 class="mb-4 text-4xl font-bold">博客</h1>
		<p class="text-muted-foreground">分享技术、想法和经验</p>
	</div>

	<div class="space-y-6">
		{#each posts as post}
			<article class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg" style="border: 0 solid !important;">
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

	{#if posts.length === 0}
		<div class="py-12 text-center">
			<p class="text-muted-foreground">暂无文章</p>
		</div>
	{/if}

	<div class="mt-12 text-center">
		<Button variant="outline" onclick={() => window.history.back()}>
			返回首页
		</Button>
	</div>
</div>
