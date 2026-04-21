<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	let {
		customFontName = $bindable(),
		onFontUpload,
		onRemoveFont
	}: {
		customFontName: string;
		onFontUpload: (e: Event) => void;
		onRemoveFont: () => void;
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>自定义字体</CardTitle>
	</CardHeader>
	<CardContent>
		<input
			type="file"
			accept=".ttf,.otf,.woff,.woff2"
			onchange={onFontUpload}
			class="hidden"
			id="font-upload"
		/>
		<Label
			for="font-upload"
			class="flex items-center justify-center w-full h-16 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
		>
			<div class="flex flex-col items-center gap-1 text-muted-foreground">
				<Icon icon="mdi:font-download" class="h-5 w-5" />
				<span class="text-xs">{customFontName || '点击上传字体'}</span>
			</div>
		</Label>
		{#if customFontName}
			<Button variant="outline" size="sm" class="mt-2" onclick={onRemoveFont}>
				移除字体
			</Button>
		{/if}
	</CardContent>
</Card>
