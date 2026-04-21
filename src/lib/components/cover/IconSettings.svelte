<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import Icon from '@iconify/svelte';

	let {
		showIcon = $bindable(),
		localIcon = $bindable(),
		searchQuery = $bindable(),
		searchResults = $bindable(),
		iconName = $bindable(),
		onLocalIconUpload,
		onSearchInput,
		onSelectIcon
	}: {
		showIcon: boolean;
		localIcon: string | null;
		searchQuery: string;
		searchResults: string[];
		iconName: string;
		onLocalIconUpload: (e: Event) => void;
		onSearchInput: (e: Event) => void;
		onSelectIcon: (icon: string) => void;
	} = $props();
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center justify-between">
			<span>图标设置</span>
			<label class="flex items-center gap-2 cursor-pointer">
				<Checkbox bind:checked={showIcon} />
				<span class="text-sm font-normal">显示图标</span>
			</label>
		</CardTitle>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid grid-cols-2 gap-2">
			<div>
				<input
					type="file"
					accept="image/*"
					onchange={onLocalIconUpload}
					class="hidden"
					id="icon-upload"
				/>
				<Label
					for="icon-upload"
					class="flex items-center justify-center h-10 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
				>
					<Icon icon="mdi:image" class="mr-2 h-4 w-4" />
					<span class="text-xs">{localIcon ? '更换图片' : '上传图标'}</span>
				</Label>
			</div>
			<Input
				value={searchQuery}
				oninput={onSearchInput}
				placeholder="搜索图标库..."
				class="h-10"
			/>
		</div>

		{#if searchResults.length > 0}
			<div class="grid grid-cols-10 gap-0.5 max-h-40 overflow-y-auto p-0.5 border rounded-lg">
				{#each searchResults as icon}
					<button
						onclick={() => onSelectIcon(icon)}
						class="p-0.5 rounded hover:bg-accent transition-colors aspect-square flex items-center justify-center"
						title={icon}
					>
						<div
							class="w-full h-full flex items-center justify-center border rounded {icon ===
							iconName
								? 'border-primary bg-primary/10'
								: 'border-border'}"
						>
							<img
								src={`https://api.iconify.design/${icon.split(':')[0]}/${icon.split(':')[1]}.svg`}
								class="w-3 h-3"
								alt={icon}
							/>
						</div>
					</button>
				{/each}
			</div>
		{/if}

		<div class="text-xs text-muted-foreground">
			当前: {iconName}
		</div>
	</CardContent>
</Card>
