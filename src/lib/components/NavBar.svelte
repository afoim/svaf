<script lang="ts">
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config/site';

	// 检查是否为首页
	const isHomePage = $derived($page.route.id === '/');
</script>

{#if !isHomePage}
	<nav class="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
		<div class="flex h-14 items-center justify-center">
			<a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
				<img src={siteConfig.icon} alt="Site Icon" class="h-6 w-6 rounded-full" />
				<span class="font-medium">{siteConfig.title}</span>
			</a>
		</div>
	</nav>
{/if}