<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Slider } from '$lib/components/ui/slider';
	import * as Tabs from '$lib/components/ui/tabs';
	import Icon from '@iconify/svelte';
	import { siteConfig } from '$lib/config/site';

	let hue = siteConfig.themeColor?.hue || 250;

	// 文本状态
	let leftText = $state('鸣潮');
	let rightText = $state('牛逼');
	
	// 图标状态
	let iconName = $state('arcticons:wuthering-waves');
	let iconSize = $state(64);
	let iconSvg = $state('');
	let localIcon = $state<string | null>(null);
	let showIcon = $state(true);
	let iconColor = $state('#000000');
	let useOriginalIconColor = $state(true);
	let iconRadius = $state(0);
	
	// 字体状态
	let fontSize = $state(64);
	let customFont = $state<string | null>(null);
	let customFontName = $state('');
	let fontWeight = $state(400);
	
	// 间距
	let gap = $state(20);
	
	// 颜色状态
	let color = $state('#000000');
	let bgColor = $state('#ffffff');
	let bgColorOpacity = $state(1);
	let linkColor = $state(true);
	
	// 阴影状态
	let textShadow = $state({ x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 });
	let iconShadow = $state({ x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 });
	let shadowTarget = $state<'both' | 'text' | 'icon'>('both');
	
	// 图标背景状态
	let iconBgEnabled = $state(false);
	let iconBgRadius = $state(20);
	let iconBgColor = $state('#000000');
	let iconBgOpacity = $state(0.2);
	let iconBgBlur = $state(0);
	let iconBgPadding = $state(10);
	
	// 背景图片状态
	let bgImage = $state<string | null>(null);
	let bgImageX = $state(0);
	let bgImageY = $state(0);
	let bgImageScale = $state(1);
	let bgBlur = $state(0);
	let bgOpacity = $state(1);
	let isBgDragOver = $state(false);
	let isDragging = $state(false);
	
	// 图标搜索状态
	let searchQuery = $state('');
	let searchResults = $state<string[]>([]);
	let isSearching = $state(false);
	let searchDebounce: ReturnType<typeof setTimeout>;
	
	// 比例状态
	let ratios = $state([
		{ label: '1:1', w: 1, h: 1, checked: false },
		{ label: '4:3', w: 4, h: 3, checked: false },
		{ label: '16:9', w: 16, h: 9, checked: true },
		{ label: '21:9', w: 21, h: 9, checked: false }
	]);
	
	// 缩放链接状态
	let linkScale = $state(true);
	let lastFontSize = $state(fontSize);
	let lastIconSize = $state(iconSize);
	
	// 导出配置
	let exportConfig = $state({
		format: 'png' as 'png' | 'svg',
		scales: [1] as number[],
		filename: 'cover',
		transparentBg: false,
		exportRatios: [] as string[]
	});
	
	// Canvas 引用
	let svgContainer: SVGSVGElement;
	
	// 拖拽状态
	let dragStartX = 0;
	let dragStartY = 0;
	let initialImageX = 0;
	let initialImageY = 0;
	let activePointers = new Map<number, { x: number; y: number }>();
	let initialPinchDistance = 0;
	let initialScale = 1;
	
	// 计算画布尺寸
	const BASE_HEIGHT = 900;
	let activeRatios = $derived(ratios.filter((r) => r.checked));
	let visualRatios = $derived(activeRatios.length > 0 ? activeRatios : [ratios[2]]);
	let maxWidthRatio = $derived(
		visualRatios.reduce((max, r) => (r.w / r.h > max ? r.w / r.h : max), 0)
	);
	let canvasWidth = $derived(Math.round(BASE_HEIGHT * maxWidthRatio));
	let canvasHeight = $derived(BASE_HEIGHT);
	
	// 辅助函数
	function hexToRgba(hex: string, alpha: number) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
	
	function updateShadow(key: string, value: string | number) {
		if (shadowTarget === 'both' || shadowTarget === 'text') {
			textShadow = { ...textShadow, [key]: value };
		}
		if (shadowTarget === 'both' || shadowTarget === 'icon') {
			iconShadow = { ...iconShadow, [key]: value };
		}
	}
	
	// 颜色处理
	function handleColorChange(newColor: string, type: 'text' | 'icon') {
		if (type === 'text') {
			color = newColor;
			if (linkColor) iconColor = newColor;
		} else {
			iconColor = newColor;
			if (linkColor) color = newColor;
		}
	}
	
	// 字体大小处理
	function handleFontSizeChange(value: number[]) {
		const newVal = value[0];
		if (linkScale) {
			const ratio = newVal / lastFontSize;
			iconSize = Math.round(iconSize * ratio);
			lastIconSize = iconSize;
		}
		fontSize = newVal;
		lastFontSize = newVal;
	}
	
	// 图标大小处理
	function handleIconSizeChange(value: number[]) {
		const newVal = value[0];
		if (linkScale) {
			const ratio = newVal / lastIconSize;
			fontSize = Math.round(fontSize * ratio);
			lastFontSize = fontSize;
		}
		iconSize = newVal;
		lastIconSize = newVal;
	}
	
	// 背景图片上传
	function handleBgImageUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) loadBgImageFile(file);
	}
	
	function loadBgImageFile(file: File) {
		if (!file.type.startsWith('image/')) return;
		const reader = new FileReader();
		reader.onload = (e) => {
			bgImage = e.target?.result as string;
			bgImageX = 0;
			bgImageY = 0;
			bgImageScale = 1;
			bgBlur = 0;
			bgOpacity = 1;
		};
		reader.readAsDataURL(file);
	}
	
	// 字体上传
	function handleFontUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const fontData = e.target?.result as ArrayBuffer;
				customFontName = file.name.replace(/\.[^/.]+$/, '');
				customFont = URL.createObjectURL(new Blob([fontData]));
				const fontFace = new FontFace(customFontName, `url(${customFont})`);
				fontFace.load().then((loadedFace) => {
					document.fonts.add(loadedFace);
				});
			};
			reader.readAsArrayBuffer(file);
		}
	}
	
	// 图标搜索
	async function handleSearch() {
		if (!searchQuery) {
			searchResults = [];
			return;
		}
		isSearching = true;
		try {
			const res = await fetch(
				`https://api.iconify.design/search?query=${encodeURIComponent(searchQuery)}&limit=20`
			);
			const data = await res.json();
			searchResults = data.icons || [];
		} catch (e) {
			console.error(e);
			searchResults = [];
		} finally {
			isSearching = false;
		}
	}
	
	function onSearchInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		searchQuery = val;
		clearTimeout(searchDebounce);
		if (val.trim()) {
			searchDebounce = setTimeout(() => handleSearch(), 500);
		} else {
			searchResults = [];
		}
	}
	
	// 本地图标上传
	function handleLocalIconUpload(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				localIcon = e.target?.result as string;
				iconName = '本地图片';
				iconSvg = '';
			};
			reader.readAsDataURL(file);
		}
	}
	
	function selectIcon(icon: string) {
		iconName = icon;
		localIcon = null;
	}
	
	// 拖拽处理
	function handleBgDragOver(e: DragEvent) {
		e.preventDefault();
		isBgDragOver = true;
	}
	
	function handleBgDragLeave(e: DragEvent) {
		e.preventDefault();
		isBgDragOver = false;
	}
	
	function handleBgDrop(e: DragEvent) {
		e.preventDefault();
		isBgDragOver = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) loadBgImageFile(file);
	}
	
	// 指针事件处理
	function handlePointerDown(e: PointerEvent) {
		if (!bgImage) return;
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		
		if (activePointers.size === 1) {
			isDragging = true;
			dragStartX = e.clientX;
			dragStartY = e.clientY;
			initialImageX = bgImageX;
			initialImageY = bgImageY;
		} else if (activePointers.size === 2) {
			isDragging = false;
			const points = Array.from(activePointers.values());
			initialPinchDistance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
			initialScale = bgImageScale;
		}
	}
	
	function handlePointerMove(e: PointerEvent) {
		if (!bgImage || !activePointers.has(e.pointerId)) return;
		e.preventDefault();
		activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
		
		if (activePointers.size === 2) {
			const points = Array.from(activePointers.values());
			const currentDistance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
			if (initialPinchDistance > 0) {
				const scaleFactor = currentDistance / initialPinchDistance;
				bgImageScale = Math.max(0.1, Math.min(initialScale * scaleFactor, 10));
			}
		} else if (activePointers.size === 1 && isDragging) {
			const deltaX = e.clientX - dragStartX;
			const deltaY = e.clientY - dragStartY;
			bgImageX = initialImageX + deltaX / bgImageScale;
			bgImageY = initialImageY + deltaY / bgImageScale;
		}
	}
	
	function handlePointerUp(e: PointerEvent) {
		activePointers.delete(e.pointerId);
		(e.currentTarget as Element).releasePointerCapture(e.pointerId);
		if (activePointers.size < 2) initialPinchDistance = 0;
		if (activePointers.size === 0) isDragging = false;
	}
	
	function handleWheel(e: WheelEvent) {
		if (!bgImage) return;
		e.preventDefault();
		const scaleFactor = 1.1;
		if (e.deltaY < 0) {
			bgImageScale = Math.min(bgImageScale * scaleFactor, 10);
		} else {
			bgImageScale = Math.max(bgImageScale / scaleFactor, 0.1);
		}
	}
	
	// 导出功能
	async function doExport() {
		if (!svgContainer) return;
		
		const guides = svgContainer.querySelectorAll('.ratio-guide');
		for (const g of guides) (g as SVGElement).style.display = 'none';
		
		const border = svgContainer.querySelector('.canvas-border');
		if (border) (border as SVGElement).style.display = 'none';
		
		const svgClone = svgContainer.cloneNode(true) as SVGSVGElement;
		
		const ratiosToExport =
			exportConfig.exportRatios.length > 0
				? ratios.filter((r) => exportConfig.exportRatios.includes(r.label))
				: activeRatios;
		
		for (const ratio of ratiosToExport) {
			const ratioWidth = Math.round(BASE_HEIGHT * (ratio.w / ratio.h));
			const ratioHeight = BASE_HEIGHT;
			const xOffset = (canvasWidth - ratioWidth) / 2;
			
			const ratioSvgClone = svgClone.cloneNode(true) as SVGSVGElement;
			ratioSvgClone.setAttribute('width', ratioWidth.toString());
			ratioSvgClone.setAttribute('height', ratioHeight.toString());
			ratioSvgClone.setAttribute('viewBox', `${xOffset} 0 ${ratioWidth} ${ratioHeight}`);
			
			const svgData = new XMLSerializer().serializeToString(ratioSvgClone);
			const ratioFilename =
				activeRatios.length > 1
					? `${exportConfig.filename}-${ratio.label.replace(':', '-')}`
					: exportConfig.filename;
			
			if (exportConfig.format === 'svg') {
				const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
				const url = URL.createObjectURL(blob);
				downloadLink(url, `${ratioFilename}.svg`);
			} else {
				const img = new Image();
				img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
				await new Promise<void>((resolve) => {
					img.onload = () => resolve();
				});
				
				const scales = exportConfig.scales.length > 0 ? exportConfig.scales : [1];
				for (const scale of scales) {
					const canvas = document.createElement('canvas');
					canvas.width = ratioWidth * scale;
					canvas.height = ratioHeight * scale;
					const ctx = canvas.getContext('2d');
					if (!ctx) continue;
					ctx.imageSmoothingEnabled = true;
					ctx.imageSmoothingQuality = 'high';
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					const suffix = scales.length > 1 ? `@${scale}x` : '';
					downloadLink(canvas.toDataURL('image/png'), `${ratioFilename}${suffix}.png`);
				}
			}
		}
		
		for (const g of guides) (g as SVGElement).style.display = '';
		if (border) (border as SVGElement).style.display = '';
	}
	
	function downloadLink(url: string, filename: string) {
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
	
	// 获取图标 SVG
	$effect(() => {
		if (iconName?.includes(':')) {
			const [prefix, name] = iconName.split(':');
			fetch(`https://api.iconify.design/${prefix}/${name}.svg`)
				.then((res) => {
					if (!res.ok) throw new Error('Icon not found');
					return res.text();
				})
				.then((svg) => {
					let processedSvg = svg
						.replace(/width="[^"]*"/g, '')
						.replace(/height="[^"]*"/g, '');
					processedSvg = processedSvg.replace(
						/<svg\b([^>]*)>/,
						'<svg$1 width="100%" height="100%" preserveAspectRatio="none">'
					);
					if (!useOriginalIconColor) {
						processedSvg = processedSvg.replace(/fill="[^"]*"/g, 'fill="currentColor"');
					}
					iconSvg = processedSvg;
				})
				.catch(() => {
					iconSvg = '';
				});
		} else {
			iconSvg = '';
		}
	});
	
	onMount(() => {
		bgColor = '#ffffff';
		color = '#000000';
		iconColor = '#000000';
		textShadow = { x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 };
		iconShadow = { x: 0, y: 0, blur: 0, color: '#000000', alpha: 0 };
	});
</script>

<!-- 由于组件太长，我会在下一个文件中继续编写模板部分 -->

<div class="flex flex-col items-center gap-8 w-full">
	<!-- 预览区域 -->
	<div
		class="w-full overflow-hidden flex justify-center bg-card p-4 rounded-xl select-none touch-none"
		role="button"
		tabindex="0"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		onpointerleave={handlePointerUp}
	>
		<svg
			bind:this={svgContainer}
			width={canvasWidth}
			height={canvasHeight}
			viewBox="0 0 {canvasWidth} {canvasHeight}"
			xmlns="http://www.w3.org/2000/svg"
			style="max-width: 100%; height: auto; cursor: {bgImage
				? isDragging
					? 'grabbing'
					: 'grab'
				: 'default'};"
			onwheel={handleWheel}
		>
			<defs>
				<pattern id="checkerboard" width="20" height="20" patternUnits="userSpaceOnUse">
					<rect width="10" height="10" fill="#e0e0e0" />
					<rect x="10" y="0" width="10" height="10" fill="#ffffff" />
					<rect x="0" y="10" width="10" height="10" fill="#ffffff" />
					<rect x="10" y="10" width="10" height="10" fill="#e0e0e0" />
				</pattern>
			</defs>

			<rect width="100%" height="100%" fill="url(#checkerboard)" />
			<rect width="100%" height="100%" fill={hexToRgba(bgColor, bgColorOpacity)} />

			{#if bgImage}
				<image
					href={bgImage}
					x={bgImageX}
					y={bgImageY}
					width={canvasWidth}
					height={canvasHeight}
					transform="scale({bgImageScale})"
					style="transform-origin: 50% 50%; filter: blur({bgBlur}px); opacity: {bgOpacity};"
					preserveAspectRatio="xMidYMid meet"
				/>
			{/if}

			<foreignObject x="0" y="0" width="100%" height="100%" style="pointer-events: none;">
				<div
					xmlns="http://www.w3.org/1999/xhtml"
					style="
						width: 100%; 
						height: 100%; 
						display: flex; 
						align-items: center; 
						justify-content: center; 
						gap: {gap}px;
						font-family: {customFontName || 'sans-serif'};
						font-weight: {fontWeight};
					"
				>
					<span
						style="
							font-size: {fontSize}px; 
							color: {color}; 
							text-shadow: {textShadow.x}px {textShadow.y}px {textShadow.blur}px {hexToRgba(
							textShadow.color,
							textShadow.alpha
						)};
							line-height: 1;
							white-space: nowrap;
						">{leftText}</span
					>

					{#if showIcon && (iconSvg || localIcon)}
						<div
							style="
								width: {iconSize + iconBgPadding * 2}px; 
								height: {iconSize + iconBgPadding * 2}px; 
								display: flex;
								align-items: center;
								justify-content: center;
								background-color: {iconBgEnabled
								? hexToRgba(iconBgColor, iconBgOpacity)
								: 'transparent'};
								backdrop-filter: {iconBgEnabled && iconBgBlur > 0 ? `blur(${iconBgBlur}px)` : 'none'};
								-webkit-backdrop-filter: {iconBgEnabled && iconBgBlur > 0
								? `blur(${iconBgBlur}px)`
								: 'none'};
								border-radius: {iconBgEnabled ? `${iconBgRadius}%` : '0'};
							"
						>
							<div
								style="
									width: {iconSize}px; 
									height: {iconSize}px; 
									aspect-ratio: 1 / 1;
									flex-shrink: 0;
									color: {useOriginalIconColor ? 'inherit' : iconColor}; 
									filter: drop-shadow({iconShadow.x}px {iconShadow.y}px {iconShadow.blur}px {hexToRgba(
									iconShadow.color,
									iconShadow.alpha
								)});
									display: flex;
									align-items: center;
									justify-content: center;
									border-radius: {iconRadius}%;
									overflow: hidden;
								"
							>
								{#if localIcon}
									<img
										src={localIcon}
										style="width: 100%; height: 100%; object-fit: contain;"
										alt="Local Icon"
									/>
								{:else}
									<div class="icon-svg-box">
										{@html iconSvg}
									</div>
								{/if}
							</div>
						</div>
					{/if}

					<span
						style="
							font-size: {fontSize}px; 
							color: {color}; 
							text-shadow: {textShadow.x}px {textShadow.y}px {textShadow.blur}px {hexToRgba(
							textShadow.color,
							textShadow.alpha
						)};
							line-height: 1;
							white-space: nowrap;
						">{rightText}</span
					>
				</div>
			</foreignObject>

			<rect
				x="0"
				y="0"
				width={canvasWidth}
				height={canvasHeight}
				fill="none"
				stroke="rgba(255, 0, 0, 0.8)"
				stroke-width="2"
				class="canvas-border"
			/>

			{#each visualRatios as ratio}
				{#if BASE_HEIGHT * (ratio.w / ratio.h) < canvasWidth}
					<g class="ratio-guide">
						<rect
							x={(canvasWidth - BASE_HEIGHT * (ratio.w / ratio.h)) / 2}
							y="0"
							width={BASE_HEIGHT * (ratio.w / ratio.h)}
							height={BASE_HEIGHT}
							fill="none"
							stroke="rgba(255, 0, 0, 0.5)"
							stroke-width="2"
							stroke-dasharray="10 5"
						/>
						<text
							x="{(canvasWidth - BASE_HEIGHT * (ratio.w / ratio.h)) / 2 + 10}"
							y="30"
							fill="rgba(255, 0, 0, 0.5)"
							font-size="20"
						>
							{ratio.label}
						</text>
					</g>
				{/if}
			{/each}
		</svg>
	</div>

	<!-- 控制面板 -->
	<Tabs.Root value="content" class="w-full">
		<Tabs.List class="grid w-full grid-cols-3">
			<Tabs.Trigger value="content">内容</Tabs.Trigger>
			<Tabs.Trigger value="style">样式</Tabs.Trigger>
			<Tabs.Trigger value="export">导出</Tabs.Trigger>
		</Tabs.List>

		<!-- 内容标签页 -->
		<Tabs.Content value="content" class="space-y-6 mt-6">
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
						<Slider value={[fontWeight]} onValueChange={(v) => (fontWeight = v[0])} min={100} max={900} step={100} />
					</div>
				</CardContent>
			</Card>

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
								onchange={handleLocalIconUpload}
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
						<div class="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto p-1 border rounded-lg">
							{#each searchResults as icon}
								<button
									onclick={() => selectIcon(icon)}
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
											class="w-4 h-4"
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

			<Card>
				<CardHeader>
					<CardTitle>背景图片</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div>
						<input
							type="file"
							accept="image/*"
							onchange={handleBgImageUpload}
							class="hidden"
							id="bg-upload"
						/>
						<Label
							for="bg-upload"
							class="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary {isBgDragOver
								? 'border-primary bg-primary/10'
								: ''}"
							ondragover={handleBgDragOver}
							ondragleave={handleBgDragLeave}
							ondrop={handleBgDrop}
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

			<Card>
				<CardHeader>
					<CardTitle>自定义字体</CardTitle>
				</CardHeader>
				<CardContent>
					<input
						type="file"
						accept=".ttf,.otf,.woff,.woff2"
						onchange={handleFontUpload}
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
						<Button
							variant="outline"
							size="sm"
							class="mt-2"
							onclick={() => {
								customFont = null;
								customFontName = '';
							}}
						>
							移除字体
						</Button>
					{/if}
				</CardContent>
			</Card>
		</Tabs.Content>

		<!-- 样式标签页 -->
		<Tabs.Content value="style" class="space-y-6 mt-6">
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
						<Slider value={[fontSize]} onValueChange={handleFontSizeChange} min={20} max={700} />
					</div>

					<div class="space-y-2">
						<Label>图标大小: {iconSize}px</Label>
						<Slider value={[iconSize]} onValueChange={handleIconSizeChange} min={20} max={700} />
					</div>

					<div class="space-y-2">
						<Label>图标圆角: {iconRadius}%</Label>
						<Slider value={[iconRadius]} onValueChange={(v) => (iconRadius = v[0])} min={0} max={50} />
					</div>

					<div class="space-y-2">
						<Label>间距: {gap}px</Label>
						<Slider value={[gap]} onValueChange={(v) => (gap = v[0])} min={0} max={200} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center justify-between">
						<span>颜色设置</span>
						<div class="flex gap-2">
							<label class="flex items-center gap-2 cursor-pointer">
								<Checkbox bind:checked={linkColor} />
								<span class="text-sm font-normal">颜色同步</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<Checkbox bind:checked={useOriginalIconColor} />
								<span class="text-sm font-normal">原色图标</span>
							</label>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center justify-between">
						<Label>文字颜色</Label>
						<div class="flex items-center gap-2">
							<Input
								type="text"
								value={color}
								oninput={(e) => handleColorChange(e.currentTarget.value, 'text')}
								class="w-24 h-8 text-xs"
							/>
							<input
								type="color"
								value={color}
								oninput={(e) => handleColorChange(e.currentTarget.value, 'text')}
								class="w-8 h-8 rounded cursor-pointer"
							/>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<Label>图标颜色</Label>
						<div class="flex items-center gap-2">
							<Input
								type="text"
								value={iconColor}
								disabled={useOriginalIconColor}
								oninput={(e) => handleColorChange(e.currentTarget.value, 'icon')}
								class="w-24 h-8 text-xs"
							/>
							<input
								type="color"
								value={iconColor}
								disabled={useOriginalIconColor}
								oninput={(e) => handleColorChange(e.currentTarget.value, 'icon')}
								class="w-8 h-8 rounded cursor-pointer"
							/>
						</div>
					</div>

					<div class="flex items-center justify-between">
						<Label>背景颜色</Label>
						<div class="flex items-center gap-2">
							<Input type="text" bind:value={bgColor} class="w-24 h-8 text-xs" />
							<input type="color" bind:value={bgColor} class="w-8 h-8 rounded cursor-pointer" />
						</div>
					</div>

					<div class="space-y-2">
						<Label>背景不透明度: {Math.round(bgColorOpacity * 100)}%</Label>
						<Slider
							value={[bgColorOpacity]}
							onValueChange={(v) => (bgColorOpacity = v[0])}
							min={0}
							max={1}
							step={0.01}
						/>
					</div>
				</CardContent>
			</Card>

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
								oninput={(e) => updateShadow('color', e.currentTarget.value)}
								class="w-20 h-6 text-xs"
							/>
							<input
								type="color"
								value={shadowTarget === 'icon' ? iconShadow.color : textShadow.color}
								oninput={(e) => updateShadow('color', e.currentTarget.value)}
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
								oninput={(e) => updateShadow('blur', Number(e.currentTarget.value))}
								class="h-8"
							/>
						</div>
						<div class="space-y-2">
							<Label class="text-xs">水平</Label>
							<Input
								type="number"
								value={shadowTarget === 'icon' ? iconShadow.x : textShadow.x}
								oninput={(e) => updateShadow('x', Number(e.currentTarget.value))}
								class="h-8"
							/>
						</div>
						<div class="space-y-2">
							<Label class="text-xs">垂直</Label>
							<Input
								type="number"
								value={shadowTarget === 'icon' ? iconShadow.y : textShadow.y}
								oninput={(e) => updateShadow('y', Number(e.currentTarget.value))}
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
							onValueChange={(v) => updateShadow('alpha', v[0])}
							min={0}
							max={1}
							step={0.01}
						/>
					</div>
				</CardContent>
			</Card>
		</Tabs.Content>

		<!-- 导出标签页 -->
		<Tabs.Content value="export" class="space-y-6 mt-6">
			<Card>
				<CardHeader>
					<CardTitle>画板比例</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-2 gap-2">
						{#each ratios as ratio}
							<label class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent">
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
								<label class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-accent">
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
								<input
									type="radio"
									bind:group={exportConfig.format}
									value="png"
									class="hidden"
								/>
								<span class="font-bold">PNG</span>
							</label>
							<label
								class="flex-1 flex items-center justify-center gap-1 p-2 border rounded-lg cursor-pointer {exportConfig.format ===
								'svg'
									? 'border-primary bg-primary/5'
									: ''}"
							>
								<input
									type="radio"
									bind:group={exportConfig.format}
									value="svg"
									class="hidden"
								/>
								<span class="font-bold">SVG</span>
							</label>
						</div>
					</div>

					<label class="flex items-center justify-between p-2 border rounded cursor-pointer">
						<span>背景透明</span>
						<Checkbox bind:checked={exportConfig.transparentBg} />
					</label>

					<Button onclick={doExport} disabled={activeRatios.length === 0} class="w-full" size="lg">
						<Icon icon="mdi:download" class="mr-2 h-5 w-5" />
						导出图片
					</Button>
				</CardContent>
			</Card>
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	.icon-svg-box {
		width: 100%;
		height: 100%;
		aspect-ratio: 1 / 1;
	}
	.icon-svg-box :global(svg) {
		width: 100% !important;
		height: 100% !important;
		display: block;
	}
</style>
