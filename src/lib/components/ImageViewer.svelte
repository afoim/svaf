<script lang="ts">
	import { onMount } from 'svelte';
	import PhotoSwipeLightbox from 'photoswipe/lightbox';
	import 'photoswipe/style.css';

	onMount(() => {
		// 初始化 PhotoSwipe
		const lightbox = new PhotoSwipeLightbox({
			gallery: '.prose',
			children: 'img',
			pswpModule: () => import('photoswipe')
		});

		// 动态设置图片数据
		lightbox.addFilter('itemData', (itemData, index) => {
			const img = itemData.element;
			return {
				src: img.src,
				width: img.naturalWidth || 800,
				height: img.naturalHeight || 600,
				alt: img.alt || ''
			};
		});

		// 为图片添加点击样式
		lightbox.on('uiRegister', () => {
			const images = document.querySelectorAll('.prose img');
			images.forEach((img) => {
				img.style.cursor = 'pointer';
			});
		});

		lightbox.init();

		return () => {
			lightbox.destroy();
		};
	});
</script>