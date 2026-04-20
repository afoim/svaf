<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { siteConfig } from '$lib/config/site';
	
	// 示例数据
	const title = siteConfig.title;
	const destination = '/posts/pin/';
</script>

<svelte:head>
	<title>重定向预览 - {siteConfig.title}</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
	<div class="text-center space-y-4 max-w-md">
		<div class="flex justify-center">
			<div class="rounded-full bg-primary/10 p-6">
				<Icon icon="mdi:arrow-right-circle" class="w-16 h-16 text-primary" />
			</div>
		</div>
		
		<h1 class="text-3xl font-bold">正在重定向</h1>
		
		<p class="text-lg text-muted-foreground">
			{title} 正在将您重定向至
		</p>
		
		<div class="rounded-lg border bg-muted/50 p-4">
			<code class="text-sm break-all">{destination}</code>
		</div>
		
		<div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
			<Icon icon="mdi:loading" class="w-4 h-4 animate-spin" />
			<span>请稍候...</span>
		</div>
		
		<div class="pt-4">
			<p class="text-sm text-muted-foreground mb-4">
				如果没有自动跳转，请点击下方按钮
			</p>
			<a href={destination}>
				<Button>
					<Icon icon="mdi:open-in-new" class="w-4 h-4 mr-2" />
					手动跳转
				</Button>
			</a>
		</div>
	</div>
	
	<div class="text-center text-sm text-muted-foreground">
		<p>这是重定向页面的预览，实际使用时会自动跳转</p>
	</div>
</div>
