<script lang="ts">
	import CoverGenerator from '$lib/components/CoverGenerator.svelte';
	import PageViews from '$lib/components/PageViews.svelte';
</script>

<svelte:head>
	<title>封面制作 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-[1920px] px-4 py-8">
	<div class="mb-6">
		<h1 class="text-3xl font-bold mb-2">封面制作</h1>
		<div class="flex items-center gap-2 text-muted-foreground">
			<p>在线生成精美的封面图片</p>
			<span>·</span>
			<PageViews pathname="/cover/" class="text-sm" />
		</div>
	</div>

	<CoverGenerator />
</div>
