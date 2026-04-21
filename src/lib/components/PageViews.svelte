<script lang="ts">
	import { onMount } from 'svelte';
	import { spaCache } from '$lib/utils/spaCache';

	let {
		pathname,
		class: className = ''
	}: {
		pathname: string;
		class?: string;
	} = $props();

	let pageViews = $state<number | null>(null);

	async function loadPageViews() {
		pageViews = await spaCache.get(`pageviews-${pathname}`, async () => {
			const response = await fetch('https://t.2x.nz/batch', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				body: JSON.stringify([pathname])
			});

			if (response.ok) {
				const views = (await response.json()) as number[];
				return views[0] || 0;
			}
			return 0;
		});
	}

	onMount(() => {
		loadPageViews();
	});
</script>

{#if pageViews !== null}
	<span class={className}>
		{pageViews.toLocaleString()} 次浏览
	</span>
{/if}
