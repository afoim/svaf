<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { type FileItem, formatSize, getFileIcon } from './file-utils';

	let { items = [] }: { items: FileItem[] } = $props();

	let pathStack = $state<{ name: string; items: FileItem[] }[]>([
		{ name: '根目录', items }
	]);

	let currentView = $derived(pathStack[pathStack.length - 1]);

	function navigateInto(item: FileItem) {
		if (item.type === 'directory' && item.children) {
			pathStack = [...pathStack, { name: item.name, items: item.children }];
		}
	}

	function navigateToLevel(index: number) {
		pathStack = pathStack.slice(0, index + 1);
	}

	function goBack() {
		if (pathStack.length > 1) pathStack = pathStack.slice(0, -1);
	}
</script>

<div class="flex flex-col">
	<!-- 面包屑 -->
	<div
		class="mb-4 flex items-center gap-1 overflow-x-auto whitespace-nowrap rounded-lg bg-muted p-2 text-sm"
	>
		{#each pathStack as folder, i}
			{#if i > 0}
				<Icon icon="mdi:chevron-right" class="size-4 shrink-0 text-muted-foreground" />
			{/if}
			<button
				type="button"
				class="rounded px-2 py-1 transition-colors hover:bg-accent {i === pathStack.length - 1
					? 'font-bold text-primary'
					: 'text-muted-foreground'}"
				onclick={() => navigateToLevel(i)}
			>
				{folder.name}
			</button>
		{/each}
	</div>

	<!-- 表头 -->
	<div
		class="mb-1 flex items-center border-b px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
	>
		<span class="flex-1">名称</span>
		<span class="w-24 text-right">大小</span>
		<span class="w-12"></span>
	</div>

	<div class="divide-y divide-border/40">
		{#if pathStack.length > 1}
			<button
				type="button"
				onclick={goBack}
				class="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
			>
				<Icon
					icon="mdi:arrow-up-bold"
					class="size-5 text-muted-foreground group-hover:text-primary"
				/>
				<span class="font-medium text-muted-foreground group-hover:text-foreground">
					... (返回上一级)
				</span>
			</button>
		{/if}

		{#each currentView.items as item (item.path)}
			{#if item.type === 'directory'}
				<button
					type="button"
					onclick={() => navigateInto(item)}
					class="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
				>
					<Icon
						icon="mdi:folder"
						class="size-5 text-primary transition-transform group-hover:scale-110"
					/>
					<span class="flex-1 font-medium">{item.name}</span>
					<Icon
						icon="mdi:chevron-right"
						class="size-5 text-muted-foreground group-hover:text-foreground"
					/>
				</button>
			{:else}
				<a
					href={`/${item.path}`}
					download={item.name}
					target="_blank"
					rel="noopener noreferrer"
					class="group flex items-center justify-between rounded-lg px-3 py-2 no-underline transition-colors hover:bg-accent"
				>
					<div class="flex flex-1 items-center gap-2 min-w-0">
						<Icon
							icon={getFileIcon(item.name)}
							class="size-5 shrink-0 text-muted-foreground group-hover:text-primary"
						/>
						<span class="truncate text-muted-foreground group-hover:text-foreground">
							{item.name}
						</span>
					</div>
					<div class="flex items-center gap-4 text-xs text-muted-foreground">
						<span class="w-24 text-right">{formatSize(item.size)}</span>
						<span
							class="flex w-12 justify-center opacity-0 transition-opacity group-hover:opacity-100"
							title="下载"
						>
							<Icon icon="mdi:download" class="size-5" />
						</span>
					</div>
				</a>
			{/if}
		{/each}

		{#if currentView.items.length === 0}
			<div class="py-12 text-center text-muted-foreground">
				<Icon icon="mdi:folder-off-outline" class="mx-auto mb-2 size-10" />
				<p>文件夹为空</p>
			</div>
		{/if}
	</div>
</div>
