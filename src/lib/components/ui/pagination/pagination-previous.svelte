<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/utils.js";
	import { PaginationLink } from "./index.js";
	type PaginationPreviousProps = ComponentProps<typeof PaginationLink>;

	let { class: className, ...restProps }: PaginationPreviousProps = $props();
</script>

<PaginationLink
	aria-label="Go to previous page"
	size="default"
	class={cn("pl-2!", className)}
	{...restProps}
>
	<Icon icon="hugeicons:arrow-left-01" data-icon="inline-start"  />
	<span class="cn-pagination-previous-text hidden sm:block">Previous</span>
</PaginationLink>
