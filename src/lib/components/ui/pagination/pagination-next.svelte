<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/utils.js";
	import { PaginationLink } from "./index.js";
	type PaginationNextProps = ComponentProps<typeof PaginationLink>;

	let { class: className, ...restProps }: PaginationNextProps = $props();
</script>

<PaginationLink
	aria-label="Go to next page"
	size="default"
	class={cn("pr-2!", className)}
	{...restProps}
>
	<span class="cn-pagination-next-text hidden sm:block">Next</span>
	<Icon icon="hugeicons:arrow-right-01" data-icon="inline-end"  />
</PaginationLink>
