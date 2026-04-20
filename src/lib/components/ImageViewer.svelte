<script lang="ts">
	import { onMount } from 'svelte';
	import PhotoSwipeLightbox from 'photoswipe/lightbox';
	import 'photoswipe/style.css';

	onMount(() => {
		// 初始化 PhotoSwipe
		const lightbox = new PhotoSwipeLightbox({
			gallery: '.prose',
			children: 'img',
			pswpModule: () => import('photoswipe'),
			// 配置选项
			showHideAnimationType: 'fade',
			bgOpacity: 0.8,
			spacing: 0.1,
			allowPanToNext: false,
			zoom: true,
			close: true,
			arrowKeys: true,
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

		// 为图片添加样式
		lightbox.on('uiRegister', () => {
			const images = document.querySelectorAll('.prose img');
			images.forEach((img) => {
				img.style.cursor = 'pointer';
				img.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
			});
		});

		lightbox.init();

		return () => {
			lightbox.destroy();
		};
	});
</script>

<style>
	/* 图片悬停效果 */
	:global(.prose img) {
		cursor: pointer !important;
		transition: transform 0.2s ease, box-shadow 0.2s ease !important;
	}

	:global(.prose img:hover) {
		transform: scale(1.02);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	/* PhotoSwipe 自定义样式 */
	:global(.pswp) {
		--pswp-bg: rgba(0, 0, 0, 0.85);
	}

	:global(.pswp__button) {
		background-color: rgba(0, 0, 0, 0.5) !important;
		border-radius: 50% !important;
	}

	:global(.pswp__button:hover) {
		background-color: rgba(0, 0, 0, 0.7) !important;
	}
</style>