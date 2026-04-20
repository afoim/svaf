<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { resolvePostAssetPath } from '$lib/utils/markdown';

	let { children } = $props();

	onMount(() => {
		const slug = $page.params.slug;
		const proseElement = document.querySelector('.prose');
		
		if (proseElement && slug) {
			// 处理所有图片的相对路径
			const images = proseElement.querySelectorAll('img');
			images.forEach((img) => {
				const src = img.getAttribute('src');
				if (src && !src.startsWith('/') && !src.startsWith('http')) {
					img.src = resolvePostAssetPath(slug, src);
				}
			});
		}
	});
</script>

{@render children()}
