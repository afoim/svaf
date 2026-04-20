<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
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
	<Card.Root class="w-full max-w-md">
		<Card.Content class="pt-6">
			<div class="text-center space-y-6">
				<div class="flex justify-center">
					<div class="rounded-full bg-primary/10 p-6">
						<Icon icon="mdi:arrow-right-circle" class="w-16 h-16 text-primary" />
					</div>
				</div>
				
				<div class="space-y-2">
					<Card.Title class="text-3xl">正在重定向</Card.Title>
					<Card.Description class="text-lg">
						{title} 正在将您重定向至
					</Card.Description>
				</div>
				
				<Card.Root class="bg-muted/50">
					<Card.Content class="p-4">
						<code class="text-sm break-all">{destination}</code>
					</Card.Content>
				</Card.Root>
				
				<div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<Icon icon="mdi:loading" class="w-4 h-4 animate-spin" />
					<span>请稍候...</span>
				</div>
				
				<div class="space-y-4">
					<p class="text-sm text-muted-foreground">
						如果没有自动跳转，请点击下方按钮
					</p>
					<a href={destination}>
						<Button class="w-full">
							<Icon icon="mdi:open-in-new" class="w-4 h-4 mr-2" />
							手动跳转
						</Button>
					</a>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
	
	<p class="text-center text-sm text-muted-foreground">
		这是重定向页面的预览，实际使用时会自动跳转
	</p>
</div>
