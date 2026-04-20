<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	let showButton = false;
	let scrollY = 0;

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
			showButton = scrollY > 300; // 滚动超过300px时显示按钮
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};
</script>

<svelte:window bind:scrollY />

{#if showButton}
	<button
		on:click={scrollToTop}
		class="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
		aria-label="回到顶部"
	>
		<Icon icon="mdi:chevron-up" class="w-5 h-5" />
	</button>
{/if}

<style>
	button {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>