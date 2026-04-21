<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';

	let {
		leftText = $bindable(),
		rightText = $bindable(),
		fontWeight = $bindable()
	}: {
		leftText: string;
		rightText: string;
		fontWeight: number;
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle>文本设置</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="space-y-2">
			<Label for="left-text">左侧文字</Label>
			<Input id="left-text" bind:value={leftText} />
		</div>

		<div class="space-y-2">
			<Label for="right-text">右侧文字</Label>
			<Input id="right-text" bind:value={rightText} />
		</div>

		<div class="space-y-2">
			<Label>字体粗细: {fontWeight}</Label>
			<Slider
				value={[fontWeight]}
				onValueChange={(v) => (fontWeight = v[0])}
				min={100}
				max={900}
				step={100}
			/>
		</div>
	</CardContent>
</Card>
