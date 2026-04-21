<script lang="ts">
	import { DialogContent as DialogContentPrimitive } from 'bits-ui';
	import { X } from 'lucide-svelte';
	import { cn } from '@/lib/utils';
	
	let { className, ...props } = $props<{
		className?: string;
	}>();
</script>

<DialogContentPrimitive
	class={cn(
		'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-left-2 data-[side=right]:slide-in-from-right-2 data-[side=top]:slide-in-from-top-2 sm:rounded-lg',
		className
	)}
	{...props}
>
	<slot />
	<DialogPrimitive.Close class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
		<X class="h-4 w-4" />
		<span class="sr-only">Close</span>
	</DialogPrimitive.Close>
</DialogContentPrimitive>