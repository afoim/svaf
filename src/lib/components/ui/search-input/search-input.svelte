<script lang="ts">
	import { cn } from "$lib/utils.js";
	import Icon from "@iconify/svelte";
	import { onMount, tick } from "svelte";

	type Props = {
		value?: string;
		placeholder?: string;
		isLoading?: boolean;
		showHistory?: boolean;
		maxHistoryItems?: number;
		shortcutKey?: string;
		class?: string;
		onclear?: () => void;
		onsearch?: (query: string) => void;
	};

	let {
		value = $bindable(""),
		placeholder = "搜索...",
		isLoading = false,
		showHistory = true,
		maxHistoryItems = 5,
		shortcutKey = "/",
		class: className,
		onclear,
		onsearch
	}: Props = $props();

	let inputRef: HTMLInputElement | null = $state(null);
	let isFocused = $state(false);
	let showHistoryDropdown = $state(false);
	let searchHistory = $state<string[]>([]);
	let highlightedHistoryIndex = $state(-1);

	const HISTORY_KEY = "search-history";

	onMount(() => {
		loadHistory();
		document.addEventListener("keydown", handleGlobalKeydown);
		return () => {
			document.removeEventListener("keydown", handleGlobalKeydown);
		};
	});

	function loadHistory() {
		try {
			const stored = localStorage.getItem(HISTORY_KEY);
			if (stored) {
				searchHistory = JSON.parse(stored);
			}
		} catch {
			searchHistory = [];
		}
	}

	function saveHistory(query: string) {
		if (!query.trim()) return;
		const filtered = searchHistory.filter(h => h !== query);
		searchHistory = [query, ...filtered].slice(0, maxHistoryItems);
		try {
			localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
		} catch {
			// ignore
		}
	}

	function clearHistory() {
		searchHistory = [];
		try {
			localStorage.removeItem(HISTORY_KEY);
		} catch {
			// ignore
		}
	}

	function handleGlobalKeydown(e: KeyboardEvent) {
		if (e.key === shortcutKey && !isFocused && document.activeElement !== inputRef) {
			e.preventDefault();
			inputRef?.focus();
		}
		if (e.key === "Escape" && isFocused) {
			inputRef?.blur();
			showHistoryDropdown = false;
		}
	}

	function handleFocus() {
		isFocused = true;
		if (showHistory && searchHistory.length > 0 && !value) {
			showHistoryDropdown = true;
		}
	}

	function handleBlur() {
		isFocused = false;
		// 延迟关闭以便点击历史项
		setTimeout(() => {
			showHistoryDropdown = false;
			highlightedHistoryIndex = -1;
		}, 150);
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		showHistoryDropdown = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" && value.trim()) {
			saveHistory(value.trim());
			showHistoryDropdown = false;
			onsearch?.(value.trim());
		}

		// 历史记录导航
		if (showHistoryDropdown && searchHistory.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				highlightedHistoryIndex = Math.min(highlightedHistoryIndex + 1, searchHistory.length - 1);
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				highlightedHistoryIndex = Math.max(highlightedHistoryIndex - 1, 0);
			} else if (e.key === "Enter" && highlightedHistoryIndex >= 0) {
				e.preventDefault();
				value = searchHistory[highlightedHistoryIndex];
				showHistoryDropdown = false;
				highlightedHistoryIndex = -1;
			}
		}
	}

	function selectHistoryItem(item: string) {
		value = item;
		showHistoryDropdown = false;
		inputRef?.focus();
	}

	function handleClear() {
		value = "";
		onclear?.();
		inputRef?.focus();
	}
</script>

<div class="relative" role="search">
	<div
		class={cn(
			"relative flex items-center rounded-2xl border bg-background/50 backdrop-blur-sm transition-all duration-200",
			"hover:border-primary/30 hover:shadow-sm",
			isFocused && "border-primary/50 shadow-md ring-2 ring-primary/10",
			className
		)}
	>
		<!-- 搜索图标 -->
		<div class="pointer-events-none absolute left-4 text-muted-foreground transition-colors" class:text-primary={isFocused}>
			{#if isLoading}
				<Icon icon="mdi:loading" class="h-5 w-5 animate-spin" />
			{:else}
				<Icon icon="mdi:magnify" class="h-5 w-5" />
			{/if}
		</div>

		<!-- 输入框 -->
		<input
			bind:this={inputRef}
			type="text"
			{value}
			oninput={handleInput}
			onfocus={handleFocus}
			onblur={handleBlur}
			onkeydown={handleKeydown}
			{placeholder}
			aria-label={placeholder}
			aria-autocomplete="list"
			aria-expanded={showHistoryDropdown}
			aria-controls="search-history-dropdown"
			class="h-12 w-full bg-transparent px-12 text-base outline-none placeholder:text-muted-foreground/60 md:text-sm"
		/>

		<!-- 快捷键提示 -->
		{#if !isFocused && !value && shortcutKey}
			<kbd class="pointer-events-none absolute right-4 hidden rounded-md border bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground shadow-sm transition-opacity md:block">
				{shortcutKey}
			</kbd>
		{/if}

		<!-- 清除按钮 -->
		{#if value}
			<button
				type="button"
				onclick={handleClear}
				aria-label="清除搜索"
				class="absolute right-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			>
				<Icon icon="mdi:close-circle" class="h-5 w-5" />
			</button>
		{/if}
	</div>

	<!-- 搜索历史下拉 -->
	{#if showHistoryDropdown && searchHistory.length > 0}
		<div
			id="search-history-dropdown"
			role="listbox"
			class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg animate-in fade-in-0 slide-in-from-top-2 duration-200"
		>
			<div class="flex items-center justify-between border-b px-3 py-2">
				<span class="text-xs text-muted-foreground">搜索历史</span>
				<button
					type="button"
					onclick={clearHistory}
					class="text-xs text-muted-foreground transition-colors hover:text-foreground"
				>
					清除
				</button>
			</div>
			<ul class="max-h-60 overflow-auto py-1">
				{#each searchHistory as item, i (item)}
					<li>
						<button
							type="button"
							onclick={() => selectHistoryItem(item)}
							role="option"
							aria-selected={highlightedHistoryIndex === i}
							class={cn(
								"flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
								highlightedHistoryIndex === i ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
							)}
						>
							<Icon icon="mdi:history" class="h-4 w-4 flex-shrink-0 text-muted-foreground" />
							<span class="truncate">{item}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
