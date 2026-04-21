<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '@/lib/utils';
	
	let { className } = $props<{
		className?: string;
	}>();
</script>

<DialogPrimitive.Root class={cn(className)}>
	<slot />
</DialogPrimitive.Root>