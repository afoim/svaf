<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { renderMermaidIn } from '$lib/utils/mermaid';

	let { selector = '.prose' }: { selector?: string } = $props();

	onMount(async () => {
		await tick();
		const container = document.querySelector(selector) as HTMLElement | null;
		renderMermaidIn(container);
	});
</script>
