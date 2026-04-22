<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';

	let showButton = $state(false);
	let scrollY = $state(0);

	let showCommentButton = $derived.by(() => {
		const id = $page.route?.id || '';
		return id === '/posts/[slug]' || id === '/forum/post';
	});

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

	const scrollToComments = () => {
		const el = document.getElementById('comments');
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};
</script>

<svelte:window bind:scrollY />

{#if showButton}
	<div transition:fly={{ y: 20, duration: 300 }} class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
		{#if showCommentButton}
			<Button
				size="icon-lg"
				onclick={scrollToComments}
				aria-label="跳转到评论区"
				class="size-12 shadow-lg hover:shadow-xl"
			>
				<Icon icon="mdi:comment-multiple-outline" class="size-5" />
			</Button>
		{/if}
		<Button
			size="icon-lg"
			onclick={scrollToTop}
			aria-label="回到顶部"
			class="size-12 shadow-lg hover:shadow-xl"
		>
			<Icon icon="mdi:chevron-up" class="size-5" />
		</Button>
	</div>
{/if}
