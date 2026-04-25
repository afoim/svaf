<script lang="ts">
	import { page } from '$app/stores';
	import { resolvePostAssetPath } from '$lib/utils/markdown';

	let { children } = $props();

	$effect(() => {
		const slug = $page.params.slug;
		if (!slug) return;
		// 微 tick，等子内容渲染完成
		requestAnimationFrame(() => {
			const proseElement = document.querySelector('.prose');
			if (!proseElement) return;
			const images = proseElement.querySelectorAll('img');
			images.forEach((img) => {
				const src = img.getAttribute('src');
				if (src && !src.startsWith('/') && !src.startsWith('http')) {
					img.src = resolvePostAssetPath(slug, src);
				}
			});
		});
	});
</script>

{@render children()}
