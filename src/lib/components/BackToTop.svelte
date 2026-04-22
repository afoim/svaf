<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';

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
	<div transition:fly={{ y: 20, duration: 300 }} class="fixed bottom-6 right-6 z-50">
		<Button
			size="icon-lg"
			onclick={scrollToTop}
			aria-label="回到顶部"
			class="size-12 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
		>
			<Icon icon="mdi:chevron-up" class="size-5" />
		</Button>
	</div>
{/if}