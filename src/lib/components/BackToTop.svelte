<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { tocFloating } from '$lib/stores/toc-floating';

	let scrollY = $state(0);
	let showButton = $derived(scrollY > 100);

	let showCommentButton = $derived.by(() => {
		const id = $page.route?.id || '';
		return id === '/posts/[slug]' || id === '/forum/post';
	});

	// xl 断点以下才显示 TOC 浮动按钮（桌面端用侧边 aside，不需要按钮）
	let showTocButton = $derived($tocFloating.available);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const scrollToComments = () => {
		const el = document.getElementById('comments');
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};
</script>

<svelte:window bind:scrollY />

<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
	{#if showTocButton}
		<div transition:fly={{ y: 20, duration: 300 }} class="xl:hidden">
			<Button
				size="icon-lg"
				variant="outline"
				onclick={() => tocFloating.toggle()}
				aria-label="目录"
				aria-expanded={$tocFloating.open}
				class="size-12 shadow-lg hover:shadow-xl bg-card"
			>
				<Icon
					icon={$tocFloating.open ? 'mdi:close' : 'mdi:format-list-bulleted'}
					class="size-5"
				/>
			</Button>
		</div>
	{/if}
	{#if showCommentButton}
		<div transition:fly={{ y: 20, duration: 300 }}>
			<Button
				size="icon-lg"
				onclick={scrollToComments}
				aria-label="跳转到评论区"
				class="size-12 shadow-lg hover:shadow-xl"
			>
				<Icon icon="mdi:comment-multiple-outline" class="size-5" />
			</Button>
		</div>
	{/if}
	{#if showButton}
		<div>
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
</div>
