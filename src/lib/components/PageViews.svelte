<script lang="ts">
	import { spaCache } from '$lib/utils/spaCache';

	let {
		pathname,
		cacheKey,
		class: className = ''
	}: {
		pathname: string;
		cacheKey?: string;
		class?: string;
	} = $props();

	let pageViews = $state<number | null>(null);

	async function loadPageViews() {
		const key = cacheKey ?? `pageviews-${pathname}`;
		pageViews = await spaCache.get(key, async () => {
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

	$effect(() => {
		void pathname;
		void cacheKey;
		pageViews = null;
		loadPageViews();
	});
</script>

{#if pageViews !== null}
	<span class={className}>
		{pageViews.toLocaleString()} 次浏览
	</span>
{/if}
