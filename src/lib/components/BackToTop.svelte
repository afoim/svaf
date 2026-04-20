<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	let showButton = $state(false);
	let scrollY = $state(0);

	onMount(() => {
		const handleScroll = () => {
			scrollY = window.scrollY;
			showButton = scrollY > 100; // 滚动超过100px时显示按钮
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
		transition:fly={{ y: 20, duration: 300 }}
		onclick={scrollToTop}
		class="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
		aria-label="回到顶部"
	>
		<Icon icon="mdi:chevron-up" class="w-5 h-5" />
	</button>
{/if}