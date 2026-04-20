<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	let showViewer = $state(false);
	let currentImage = $state('');
	let currentAlt = $state('');

	onMount(() => {
		// 为所有文章图片添加点击事件
		const images = document.querySelectorAll('.prose img');
		
		images.forEach((img) => {
			img.style.cursor = 'pointer';
			img.addEventListener('click', () => {
				currentImage = img.src;
				currentAlt = img.alt || '';
				showViewer = true;
			});
		});

		// ESC 键关闭查看器
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				showViewer = false;
			}
		};

		document.addEventListener('keydown', handleKeydown);
		
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	const closeViewer = () => {
		showViewer = false;
	};
</script>

{#if showViewer}
	<div 
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
		onclick={closeViewer}
		role="dialog"
		aria-modal="true"
		aria-label="图片查看器"
	>
		<!-- 关闭按钮 -->
		<button
			onclick={closeViewer}
			class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
			aria-label="关闭图片查看器"
		>
			<Icon icon="mdi:close" class="w-6 h-6" />
		</button>

		<!-- 图片容器 -->
		<div 
			class="relative max-h-[90vh] max-w-[90vw] p-4"
			onclick={(e) => e.stopPropagation()}
		>
			<img
				src={currentImage}
				alt={currentAlt}
				class="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
			/>
			
			{#if currentAlt}
				<div class="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 rounded-b-lg">
					<p class="text-sm text-center">{currentAlt}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* 为文章图片添加悬停效果 */
	:global(.prose img) {
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	:global(.prose img:hover) {
		transform: scale(1.02);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}
</style>