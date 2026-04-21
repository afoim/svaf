<script lang="ts">
	import CoverGenerator from '$lib/components/CoverGenerator.svelte';
</script>

<svelte:head>
	<title>封面制作 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-[1920px] px-4 py-8">
	<div class="mb-6">
		<h1 class="text-3xl font-bold mb-2">封面制作</h1>
		<p class="text-muted-foreground">在线生成精美的封面图片</p>
	</div>

	<CoverGenerator />
</div>
