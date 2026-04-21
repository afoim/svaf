<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	type Ratio = { label: string; w: number; h: number; checked: boolean };
	type ExportConfig = {
		format: 'png' | 'svg';
		scales: number[];
		filename: string;
		transparentBg: boolean;
		exportRatios: string[];
	};

	let {
		ratios = $bindable(),
		exportConfig = $bindable(),
		canvasWidth,
		canvasHeight,
		activeRatios,
		onExport
	}: {
		ratios: Ratio[];
		exportConfig: ExportConfig;
		canvasWidth: number;
		canvasHeight: number;
		activeRatios: Ratio[];
		onExport: () => void;
	} = $props();
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>画板比例</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-2 gap-2">
				{#each ratios as ratio}
					<label
						class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent"
					>
						<Checkbox bind:checked={ratio.checked} />
						<span class="font-mono">{ratio.label}</span>
					</label>
				{/each}
			</div>
		</CardContent>
	</Card>

	{#if exportConfig.format === 'png'}
		<Card>
			<CardHeader>
				<CardTitle>缩放倍率</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-2 gap-2">
					{#each [1, 2, 3, 4] as scale}
						<label
							class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent"
						>
							<Checkbox
								checked={exportConfig.scales.includes(scale)}
								onCheckedChange={(checked) => {
									if (checked) {
										exportConfig.scales = [...exportConfig.scales, scale].sort();
									} else {
										exportConfig.scales = exportConfig.scales.filter((s) => s !== scale);
									}
								}}
							/>
							<span class="font-mono">{scale}x</span>
						</label>
					{/each}
				</div>
				<p class="text-xs text-muted-foreground mt-2">
					{Math.round(canvasWidth)}x{Math.round(canvasHeight)} px
				</p>
			</CardContent>
		</Card>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>导出设置</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-2">
				<Label>文件名</Label>
				<Input bind:value={exportConfig.filename} />
			</div>

			<div class="space-y-2">
				<Label>格式</Label>
				<div class="flex gap-2">
					<label
						class="flex-1 flex items-center justify-center gap-1 p-2 border rounded-lg cursor-pointer {exportConfig.format ===
						'png'
							? 'border-primary bg-primary/5'
							: ''}"
					>
						<input type="radio" bind:group={exportConfig.format} value="png" class="hidden" />
						<span class="font-bold">PNG</span>
					</label>
					<label
						class="flex-1 flex items-center justify-center gap-1 p-2 border rounded-lg cursor-pointer {exportConfig.format ===
						'svg'
							? 'border-primary bg-primary/5'
							: ''}"
					>
						<input type="radio" bind:group={exportConfig.format} value="svg" class="hidden" />
						<span class="font-bold">SVG</span>
					</label>
				</div>
			</div>

			<label class="flex items-center justify-between p-2 border rounded cursor-pointer">
				<span>背景透明</span>
				<Checkbox bind:checked={exportConfig.transparentBg} />
			</label>

			<Button onclick={onExport} disabled={activeRatios.length === 0} class="w-full" size="lg">
				<Icon icon="mdi:download" class="mr-2 h-5 w-5" />
				导出图片
			</Button>
		</CardContent>
	</Card>
</div>
