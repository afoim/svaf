<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Slider } from '$lib/components/ui/slider';

	let {
		fontSize = $bindable(),
		iconSize = $bindable(),
		iconRadius = $bindable(),
		gap = $bindable(),
		linkScale = $bindable(),
		onFontSizeChange,
		onIconSizeChange
	}: {
		fontSize: number;
		iconSize: number;
		iconRadius: number;
		gap: number;
		linkScale: boolean;
		onFontSizeChange: (value: number[]) => void;
		onIconSizeChange: (value: number[]) => void;
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<span>尺寸设置</span>
			<label class="flex items-center gap-2 cursor-pointer">
				<Checkbox bind:checked={linkScale} />
				<span class="text-sm font-normal">等比缩放</span>
			</label>
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-2">
			<Label>字体大小: {fontSize}px</Label>
			<Slider value={[fontSize]} onValueChange={onFontSizeChange} min={20} max={700} />
		</div>

		<div class="space-y-2">
			<Label>图标大小: {iconSize}px</Label>
			<Slider value={[iconSize]} onValueChange={onIconSizeChange} min={20} max={700} />
		</div>

		<div class="space-y-2">
			<Label>图标圆角: {iconRadius}%</Label>
			<Slider
				value={[iconRadius]}
				onValueChange={(v) => (iconRadius = v[0])}
				min={0}
				max={50}
			/>
		</div>

		<div class="space-y-2">
			<Label>间距: {gap}px</Label>
			<Slider value={[gap]} onValueChange={(v) => (gap = v[0])} min={0} max={200} />
		</div>
	</CardContent>
</Card>
