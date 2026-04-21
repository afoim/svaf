<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Slider } from '$lib/components/ui/slider';

	let {
		iconBgEnabled = $bindable(),
		iconBgColor = $bindable(),
		iconBgPadding = $bindable(),
		iconBgRadius = $bindable(),
		iconBgBlur = $bindable(),
		iconBgOpacity = $bindable()
	}: {
		iconBgEnabled: boolean;
		iconBgColor: string;
		iconBgPadding: number;
		iconBgRadius: number;
		iconBgBlur: number;
		iconBgOpacity: number;
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>图标背景</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<label class="flex items-center justify-between cursor-pointer">
			<span>启用图标背景</span>
			<Checkbox bind:checked={iconBgEnabled} />
		</label>

		{#if iconBgEnabled}
			<div class="space-y-4 pt-4 border-t">
				<div class="flex items-center justify-between">
					<Label>背景颜色</Label>
					<div class="flex items-center gap-2">
						<Input type="text" bind:value={iconBgColor} class="w-20 h-6 text-xs" />
						<input type="color" bind:value={iconBgColor} class="w-6 h-6 rounded cursor-pointer" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label>内边距: {iconBgPadding}px</Label>
						<Slider
							value={[iconBgPadding]}
							onValueChange={(v) => (iconBgPadding = v[0])}
							min={0}
							max={100}
						/>
					</div>

					<div class="space-y-2">
						<Label>圆角: {iconBgRadius}%</Label>
						<Slider
							value={[iconBgRadius]}
							onValueChange={(v) => (iconBgRadius = v[0])}
							min={0}
							max={50}
						/>
					</div>

					<div class="space-y-2">
						<Label>模糊: {iconBgBlur}px</Label>
						<Slider
							value={[iconBgBlur]}
							onValueChange={(v) => (iconBgBlur = v[0])}
							min={0}
							max={20}
						/>
					</div>

					<div class="space-y-2">
						<Label>不透明度: {Math.round(iconBgOpacity * 100)}%</Label>
						<Slider
							value={[iconBgOpacity]}
							onValueChange={(v) => (iconBgOpacity = v[0])}
							min={0}
							max={1}
							step={0.01}
						/>
					</div>
				</div>
			</div>
		{/if}
	</CardContent>
</Card>
