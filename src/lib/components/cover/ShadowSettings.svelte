<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import Icon from '@iconify/svelte';

	type ShadowConfig = { x: number; y: number; blur: number; color: string; alpha: number };

	let {
		shadowTarget = $bindable(),
		textShadow,
		iconShadow,
		onUpdateShadow
	}: {
		shadowTarget: 'both' | 'text' | 'icon';
		textShadow: ShadowConfig;
		iconShadow: ShadowConfig;
		onUpdateShadow: (key: string, value: string | number) => void;
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<span>阴影设置</span>
			<div class="flex gap-1 border rounded-lg p-1">
				{#each [
					{ id: 'both', icon: 'mdi:layers', label: '全部' },
					{ id: 'text', icon: 'mdi:format-text', label: '文字' },
					{ id: 'icon', icon: 'mdi:star', label: '图标' }
				] as target}
					<Button
						variant={shadowTarget === target.id ? 'default' : 'ghost'}
						size="sm"
						onclick={() => (shadowTarget = target.id)}
						title={target.label}
					>
						<Icon icon={target.icon} class="h-4 w-4" />
					</Button>
				{/each}
			</div>
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="flex items-center justify-between">
			<Label>颜色</Label>
			<div class="flex items-center gap-2">
				<Input
					type="text"
					value={shadowTarget === 'icon' ? iconShadow.color : textShadow.color}
					oninput={(e) => onUpdateShadow('color', e.currentTarget.value)}
					class="w-24 h-6 text-xs"
				/>
				<input
					type="color"
					value={shadowTarget === 'icon' ? iconShadow.color : textShadow.color}
					oninput={(e) => onUpdateShadow('color', e.currentTarget.value)}
					class="w-6 h-6 rounded cursor-pointer"
				/>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-2">
			<div class="space-y-2">
				<Label class="text-xs">模糊</Label>
				<Input
					type="number"
					value={shadowTarget === 'icon' ? iconShadow.blur : textShadow.blur}
					oninput={(e) => onUpdateShadow('blur', Number(e.currentTarget.value))}
					class="h-8"
				/>
			</div>
			<div class="space-y-2">
				<Label class="text-xs">水平</Label>
				<Input
					type="number"
					value={shadowTarget === 'icon' ? iconShadow.x : textShadow.x}
					oninput={(e) => onUpdateShadow('x', Number(e.currentTarget.value))}
					class="h-8"
				/>
			</div>
			<div class="space-y-2">
				<Label class="text-xs">垂直</Label>
				<Input
					type="number"
					value={shadowTarget === 'icon' ? iconShadow.y : textShadow.y}
					oninput={(e) => onUpdateShadow('y', Number(e.currentTarget.value))}
					class="h-8"
				/>
			</div>
		</div>

		<div class="space-y-2">
			<Label
				>不透明度: {Math.round(
					(shadowTarget === 'icon' ? iconShadow.alpha : textShadow.alpha) * 100
				)}%</Label
			>
			<Slider
				value={[shadowTarget === 'icon' ? iconShadow.alpha : textShadow.alpha]}
				onValueChange={(v) => onUpdateShadow('alpha', v[0])}
				min={0}
				max={1}
				step={0.01}
			/>
		</div>
	</CardContent>
</Card>
