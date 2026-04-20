<script lang="ts">
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config/site';
	import { Button } from '$lib/components/ui/button';

	// 检查是否为首页
	const isHomePage = $derived($page.route.id === '/');
</script>

{#if !isHomePage}
	<nav class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="container flex h-14 items-center">
			<!-- 站点图标和标题 -->
			<a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
				<img src={siteConfig.icon} alt="Site Icon" class="h-8 w-8 rounded-full" />
				<span class="font-bold text-lg">{siteConfig.title}</span>
			</a>

			<!-- 导航链接 -->
			<div class="flex flex-1 items-center justify-end space-x-4">
				<nav class="flex items-center space-x-2">
					<a href="/posts">
						<Button variant="ghost" size="sm">博客</Button>
					</a>
					<a href="/">
						<Button variant="ghost" size="sm">首页</Button>
					</a>
				</nav>
			</div>
		</div>
	</nav>
{/if}