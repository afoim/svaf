<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	let {
		bgImage = $bindable(),
		bgBlur = $bindable(),
		bgOpacity = $bindable(),
		isBgDragOver = $bindable(),
		onBgImageUpload,
		onBgDragOver,
		onBgDragLeave,
		onBgDrop
	}: {
		bgImage: string | null;
		bgBlur: number;
		bgOpacity: number;
		isBgDragOver: boolean;
		onBgImageUpload: (e: Event) => void;
		onBgDragOver: (e: DragEvent) => void;
		onBgDragLeave: (e: DragEvent) => void;
		onBgDrop: (e: DragEvent) => void;
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>背景图片</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<div>
			<input
				type="file"
				accept="image/*"
				onchange={onBgImageUpload}
				class="hidden"
				id="bg-upload"
			/>
			<Label
				for="bg-upload"
				class="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary {isBgDragOver
					? 'border-primary bg-primary/10'
					: ''}"
				ondragover={onBgDragOver}
				ondragleave={onBgDragLeave}
				ondrop={onBgDrop}
			>
				<div class="flex flex-col items-center gap-1 text-muted-foreground">
					<Icon icon="mdi:upload" class="h-6 w-6" />
					<span class="text-xs"
						>{isBgDragOver ? '松开上传' : bgImage ? '点击或拖拽更换' : '点击或拖拽上传'}</span
					>
				</div>
			</Label>
		</div>

		{#if bgImage}
			<div class="space-y-2">
				<div class="flex items-center justify-between">
					<Label>模糊: {bgBlur}px</Label>
					<Button variant="destructive" size="sm" onclick={() => (bgImage = null)}>
						<Icon icon="mdi:delete" class="h-4 w-4" />
					</Button>
				</div>
				<Slider value={[bgBlur]} onValueChange={(v) => (bgBlur = v[0])} min={0} max={20} />

				<Label>不透明度: {Math.round(bgOpacity * 100)}%</Label>
				<Slider
					value={[bgOpacity]}
					onValueChange={(v) => (bgOpacity = v[0])}
					min={0}
					max={1}
					step={0.01}
				/>

				<p class="text-xs text-muted-foreground">提示: 拖拽移动位置，滚轮缩放大小</p>
			</div>
		{/if}
	</CardContent>
</Card>
