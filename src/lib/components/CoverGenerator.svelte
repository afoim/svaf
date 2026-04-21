<script lang="ts">
	import { onMount } from 'svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import CoverPreview from './cover/CoverPreview.svelte';
	import TextSettings from './cover/TextSettings.svelte';
	import IconSettings from './cover/IconSettings.svelte';
	import BackgroundSettings from './cover/BackgroundSettings.svelte';
	import FontSettings from './cover/FontSettings.svelte';
	import SizeSettings from './cover/SizeSettings.svelte';
	import ColorSettings from './cover/ColorSettings.svelte';
	import IconBackgroundSettings from './cover/IconBackgroundSettings.svelte';
	import ShadowSettings from './cover/ShadowSettings.svelte';
	import ExportSettings from './cover/ExportSettings.svelte';

	// 文本状态
	let leftText = $state('鸣潮');
	let rightText = $state('牛逼');
	let fontWeight = $state(400);

	// 图标状态
	let iconName = $state('arcticons:wuthering-waves');
	let iconSize = $state(64);
	let iconSvg = $state('');
	let localIcon = $state<string | null>(null);
	let showIcon = $state(true);
	let iconColor = $state('#000000');
	let useOriginalIconColor = $state(true);
	let iconRadius = $state(0);
	let searchQuery = $state('');
	let searchResults = $state<string[]>([]);
	let isSearching = $state(false);
	let searchDebounce: ReturnType<typeof setTimeout>;

	// 字体状态
	let fontSize = $state(64);
	let customFont = $state<string | null>(null);
	let customFontName = $state('');

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
	const BASE_HEIGHT = 600;
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

	function handleColorChange(newColor: string, type: 'text' | 'icon') {
		if (type === 'text') {
			color = newColor;
			if (linkColor) iconColor = newColor;
		} else {
			iconColor = newColor;
			if (linkColor) color = newColor;
		}
	}

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

	function handleSystemFontSelect(fontName: string) {
		customFontName = fontName;
		customFont = null;
	}

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

<div class="flex flex-col lg:flex-row gap-6 w-full">
	<!-- 左侧：预览区域 -->
	<div class="flex-1 lg:max-w-[55%]">
		<div class="lg:sticky lg:top-20">
			<CoverPreview
				bind:svgContainer
				{canvasWidth}
				{canvasHeight}
				{visualRatios}
				{bgImage}
				{bgImageX}
				{bgImageY}
				{bgImageScale}
				{bgBlur}
				{bgOpacity}
				{bgColor}
				{bgColorOpacity}
				{leftText}
				{rightText}
				{fontSize}
				{fontWeight}
				{customFontName}
				{color}
				{textShadow}
				{gap}
				{showIcon}
				{iconSvg}
				{localIcon}
				{iconSize}
				{iconBgPadding}
				{iconBgEnabled}
				{iconBgColor}
				{iconBgOpacity}
				{iconBgBlur}
				{iconBgRadius}
				{useOriginalIconColor}
				{iconColor}
				{iconShadow}
				{iconRadius}
				{isDragging}
				{hexToRgba}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onWheel={handleWheel}
			/>
		</div>
	</div>

	<!-- 右侧：控制面板 -->
	<div class="w-full lg:flex-1">
		<!-- 移动端使用 Tabs，桌面端并列显示 -->
		<div class="lg:hidden">
			<Tabs.Root value="content" class="w-full">
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="content">内容</Tabs.Trigger>
					<Tabs.Trigger value="style">样式</Tabs.Trigger>
					<Tabs.Trigger value="export">导出</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="content" class="space-y-6 mt-6">
					<TextSettings bind:leftText bind:rightText bind:fontWeight />
					<IconSettings
						bind:showIcon
						bind:localIcon
						bind:searchQuery
						bind:searchResults
						bind:iconName
						onLocalIconUpload={handleLocalIconUpload}
						{onSearchInput}
						onSelectIcon={selectIcon}
					/>
					<BackgroundSettings
						bind:bgImage
						bind:bgBlur
						bind:bgOpacity
						bind:isBgDragOver
						onBgImageUpload={handleBgImageUpload}
						onBgDragOver={handleBgDragOver}
						onBgDragLeave={handleBgDragLeave}
						onBgDrop={handleBgDrop}
					/>
					<FontSettings
						bind:customFontName
						onFontUpload={handleFontUpload}
						onSystemFontSelect={handleSystemFontSelect}
						onRemoveFont={() => {
							customFont = null;
							customFontName = '';
						}}
					/>
				</Tabs.Content>

				<Tabs.Content value="style" class="space-y-6 mt-6">
					<SizeSettings
						bind:fontSize
						bind:iconSize
						bind:iconRadius
						bind:gap
						bind:linkScale
						onFontSizeChange={handleFontSizeChange}
						onIconSizeChange={handleIconSizeChange}
					/>
					<ColorSettings
						bind:color
						bind:iconColor
						bind:bgColor
						bind:bgColorOpacity
						bind:linkColor
						bind:useOriginalIconColor
						onColorChange={handleColorChange}
					/>
					<IconBackgroundSettings
						bind:iconBgEnabled
						bind:iconBgColor
						bind:iconBgPadding
						bind:iconBgRadius
						bind:iconBgBlur
						bind:iconBgOpacity
					/>
					<ShadowSettings
						bind:shadowTarget
						{textShadow}
						{iconShadow}
						onUpdateShadow={updateShadow}
					/>
				</Tabs.Content>

				<Tabs.Content value="export" class="space-y-6 mt-6">
					<ExportSettings
						bind:ratios
						bind:exportConfig
						{canvasWidth}
						{canvasHeight}
						{activeRatios}
						onExport={doExport}
					/>
				</Tabs.Content>
			</Tabs.Root>
		</div>

		<!-- 桌面端并列显示 -->
		<div class="hidden lg:grid lg:grid-cols-3 gap-6">
			<!-- 内容列 -->
			<div class="space-y-6">
				<h2 class="text-lg font-semibold mb-4">内容</h2>
				<TextSettings bind:leftText bind:rightText bind:fontWeight />
				<IconSettings
					bind:showIcon
					bind:localIcon
					bind:searchQuery
					bind:searchResults
					bind:iconName
					onLocalIconUpload={handleLocalIconUpload}
					{onSearchInput}
					onSelectIcon={selectIcon}
				/>
				<BackgroundSettings
					bind:bgImage
					bind:bgBlur
					bind:bgOpacity
					bind:isBgDragOver
					onBgImageUpload={handleBgImageUpload}
					onBgDragOver={handleBgDragOver}
					onBgDragLeave={handleBgDragLeave}
					onBgDrop={handleBgDrop}
				/>
				<FontSettings
					bind:customFontName
					onFontUpload={handleFontUpload}
					onSystemFontSelect={handleSystemFontSelect}
					onRemoveFont={() => {
						customFont = null;
						customFontName = '';
					}}
				/>
			</div>

			<!-- 样式列 -->
			<div class="space-y-6">
				<h2 class="text-lg font-semibold mb-4">样式</h2>
				<SizeSettings
					bind:fontSize
					bind:iconSize
					bind:iconRadius
					bind:gap
					bind:linkScale
					onFontSizeChange={handleFontSizeChange}
					onIconSizeChange={handleIconSizeChange}
				/>
				<ColorSettings
					bind:color
					bind:iconColor
					bind:bgColor
					bind:bgColorOpacity
					bind:linkColor
					bind:useOriginalIconColor
					onColorChange={handleColorChange}
				/>
				<IconBackgroundSettings
					bind:iconBgEnabled
					bind:iconBgColor
					bind:iconBgPadding
					bind:iconBgRadius
					bind:iconBgBlur
					bind:iconBgOpacity
				/>
				<ShadowSettings
					bind:shadowTarget
					{textShadow}
					{iconShadow}
					onUpdateShadow={updateShadow}
				/>
			</div>

			<!-- 导出列 -->
			<div class="space-y-6">
				<h2 class="text-lg font-semibold mb-4">导出</h2>
				<ExportSettings
					bind:ratios
					bind:exportConfig
					{canvasWidth}
					{canvasHeight}
					{activeRatios}
					onExport={doExport}
				/>
			</div>
		</div>
	</div>
</div>
