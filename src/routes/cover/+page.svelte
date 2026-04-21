<script lang="ts">
	import CoverGenerator from '$lib/components/CoverGenerator.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
</script>

<svelte:head>
	<title>封面制作 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-12">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-4xl font-bold mb-2">封面制作</h1>
			<p class="text-muted-foreground">在线生成精美的封面图片</p>
		</div>
		<a href="/">
			<Button variant="outline">
				<Icon icon="mdi:home" class="mr-2 h-4 w-4" />
				返回首页
			</Button>
		</a>
	</div>

	<CoverGenerator />
</div>
