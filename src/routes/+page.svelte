<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>{siteConfig.title} - 首页</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-6">
	<img src={siteConfig.bio.avatar} alt="Avatar" class="h-32 w-32 rounded-full" />
	
	<div class="text-center">
		<h1 class="text-4xl font-bold mb-2">{siteConfig.bio.name}</h1>
		<p class="text-lg text-muted-foreground mb-4">{siteConfig.bio.bio}</p>
		<p class="text-sm text-muted-foreground">
			站点地址: <a href={siteConfig.url} class="underline hover:text-foreground">{siteConfig.url}</a>
		</p>
	</div>

	<!-- 社交媒体链接 -->
	<div class="flex flex-wrap gap-3 justify-center">
		{#each siteConfig.bio.links as link}
			<a 
				href={link.url} 
				target="_blank" 
				rel="noopener noreferrer"
				class="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
				title={link.name}
			>
				<Icon icon={link.icon} class="w-5 h-5" />
				<span class="text-sm font-medium">{link.name}</span>
			</a>
		{/each}
	</div>
	
	<div class="flex gap-2 mt-4">
		<a href="/posts">
			<Button>博客</Button>
		</a>
		<Button variant="secondary">Secondary</Button>
		<Button variant="destructive">Destructive</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="ghost">Ghost</Button>
	</div>
</div>
