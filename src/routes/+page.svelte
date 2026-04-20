<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	
	let totalPageViews = $state<number | null>(null);
	
	async function loadTotalPageViews() {
		try {
			const response = await fetch('https://t.2x.nz/batch', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				body: JSON.stringify(['/'])
			});
			
			if (response.ok) {
				const views = await response.json() as number[];
				totalPageViews = views[0] || 0;
			}
		} catch (error) {
			console.error('Failed to load total page views:', error);
		}
	}
	
	onMount(() => {
		loadTotalPageViews();
	});
</script>

<svelte:head>
	<title>{siteConfig.title} - 首页</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-6">
	<img src={siteConfig.bio.avatar} alt="Avatar" class="h-32 w-32 rounded-full" />
	
	<div class="text-center">
		<h1 class="text-4xl font-bold mb-2">{siteConfig.bio.name}</h1>
		<p class="text-lg text-muted-foreground mb-4">{siteConfig.bio.bio}</p>
		{#if totalPageViews !== null}
			<p class="text-sm text-muted-foreground">
				全站浏览量: {totalPageViews.toLocaleString()}
			</p>
		{/if}
	</div>

	<!-- 社交媒体链接 -->
	<div class="flex flex-wrap gap-3 justify-center">
		{#each siteConfig.bio.links as link}
			<a href={link.url} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" class="flex items-center gap-2">
					<Icon 
						icon={link.icon} 
						class="w-5 h-5"
						style={link.name === 'QQ群' ? 'color: #333333' : 
						       link.name === 'Telegram群' ? 'color: #0088cc' : 
						       link.name === 'Bilibili' ? 'color: #fb7299' : 
						       link.name === 'GitHub' ? 'color: #333333' : 
						       link.name === 'Folo' ? 'color: #ff6b35' : ''}
					/>
					<span class="text-sm font-medium">{link.name}</span>
				</Button>
			</a>
		{/each}
	</div>
	
	<div class="mt-4 flex gap-3">
		<a href="/posts">
			<Button class="flex items-center gap-2">
				<Icon icon="mdi:post-outline" class="w-5 h-5" />
				博客
			</Button>
		</a>
		
		<Button
			variant="outline"
			class="flex items-center gap-2"
			onclick={() => {
				if (window.cookieconsent && typeof window.cookieconsent.openPreferencesCenter === 'function') {
					window.cookieconsent.openPreferencesCenter();
				}
			}}
		>
			<Icon icon="mdi:cookie-settings" class="w-5 h-5" />
			Cookie 设置
		</Button>
	</div>
</div>
