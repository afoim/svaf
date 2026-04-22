<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { type FileItem, formatSize, getFileIcon } from './file-utils';

	let { apiBase = 'https://e3.2x.nz/api/' }: { apiBase?: string } = $props();

	let items = $state<FileItem[]>([]);
	let pathStack = $state<{ name: string; path: string }[]>([
		{ name: 'OneDrive 根目录', path: '/' }
	]);
	let loading = $state(false);
	let error = $state('');

	let currentView = $derived(pathStack[pathStack.length - 1]);

	async function fetchItems(currentPath = '/') {
		loading = true;
		items = [];
		error = '';
		try {
			const response = await fetch(`${apiBase}?path=${encodeURIComponent(currentPath)}`);
			if (!response.ok) throw new Error(`API 请求失败: ${response.status}`);

			const data = await response.json();
			const folderValue = data.folder?.value || data.value || [];

			items = folderValue
				.map((item: any) => {
					const isFolder = !!item.folder;
					const fullPath =
						currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
					return {
						name: item.name,
						path: fullPath,
						type: isFolder ? 'directory' : 'file',
						size: item.size,
						downloadUrl: isFolder
							? undefined
							: `${apiBase}raw/?path=${encodeURIComponent(fullPath)}`
					} as FileItem;
				})
				.sort((a: FileItem, b: FileItem) => {
					if (a.type === b.type) return a.name.localeCompare(b.name);
					return a.type === 'directory' ? -1 : 1;
				});
		} catch (err) {
			error = `加载失败: ${(err as Error).message}`;
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function navigateInto(item: FileItem) {
		if (item.type === 'directory') {
			pathStack = [...pathStack, { name: item.name, path: item.path }];
			await fetchItems(item.path);
		}
	}

	async function navigateToLevel(index: number) {
		pathStack = pathStack.slice(0, index + 1);
		await fetchItems(pathStack[index].path);
	}

	async function goBack() {
		if (pathStack.length > 1) {
			pathStack = pathStack.slice(0, -1);
			await fetchItems(pathStack[pathStack.length - 1].path);
		}
	}

	onMount(() => {
		fetchItems('/');
	});
</script>

<div class="flex flex-col">
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

		{#if loading}
			<span class="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
				<Icon icon="mdi:loading" class="size-4 animate-spin" />
				加载中...
			</span>
		{/if}
	</div>

	{#if error}
		<Alert variant="destructive" class="mb-4">
			<Icon icon="mdi:alert-circle-outline" />
			<AlertDescription class="flex items-center justify-between gap-2">
				<span>{error}</span>
				<Button variant="outline" size="sm" onclick={() => fetchItems(currentView.path)}>
					重试
				</Button>
			</AlertDescription>
		</Alert>
	{/if}

	<div
		class="mb-1 flex items-center border-b px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
	>
		<span class="flex-1">名称</span>
		<span class="w-24 text-right">大小</span>
		<span class="w-12"></span>
	</div>

	<div class="relative min-h-[200px] divide-y divide-border/40">
		{#if loading && items.length === 0}
			<div class="absolute inset-0 flex items-center justify-center text-muted-foreground">
				<Icon icon="mdi:loading" class="size-10 animate-spin" />
			</div>
		{/if}

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

		{#each items as item (item.path)}
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
					href={item.downloadUrl}
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

		{#if !loading && items.length === 0 && !error}
			<div class="py-12 text-center text-muted-foreground">
				<Icon icon="mdi:folder-off-outline" class="mx-auto mb-2 size-10" />
				<p>文件夹为空</p>
			</div>
		{/if}
	</div>
</div>
