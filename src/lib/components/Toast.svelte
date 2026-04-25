<script lang="ts">
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import { forumToast, type ToastMessage } from '$lib/forum/stores/toast';

	const typeConfig: Record<string, { icon: string; bg: string; border: string }> = {
		success: { icon: 'mdi:check-circle', bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-400 dark:border-green-700' },
		error: { icon: 'mdi:alert-circle', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-400 dark:border-red-700' },
		info: { icon: 'mdi:information', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-400 dark:border-blue-700' }
	};

	function iconClass(type: string) {
		return type === 'success' ? 'text-green-500' :
		       type === 'error' ? 'text-red-500' :
		       'text-blue-500';
	}
</script>

{#each $forumToast as toast (toast.id)}
	<div
		transition:fly={{ y: 20, duration: 250, opacity: 0 }}
		class="fixed bottom-6 right-6 z-[100] w-80 max-w-[calc(100vw-2rem)] rounded-lg border shadow-lg {typeConfig[toast.type].bg} {typeConfig[toast.type].border}"
		role="alert"
	>
		<button
			type="button"
			onclick={() => forumToast.dismiss(toast.id)}
			class="absolute top-2 right-2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
			aria-label="关闭"
		>
			<Icon icon="mdi:close" class="size-4 text-muted-foreground" />
		</button>
		<div class="flex items-start gap-3 p-4 pr-8">
			<Icon icon={typeConfig[toast.type].icon} class="size-5 shrink-0 {iconClass(toast.type)}" />
			<div class="min-w-0 flex-1">
				<p class="text-sm font-semibold text-foreground">{toast.title}</p>
				{#if toast.description}
					<p class="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
				{/if}
			</div>
		</div>
	</div>
{/each}
