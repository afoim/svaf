<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Switch } from '$lib/components/ui/switch';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import PageViews from '$lib/components/PageViews.svelte';

	type ToolMode = 'prism' | 'shadow';
	type UploadKind = 'source' | 'hidden';
	type LoadedImage = {
		file: File;
		name: string;
		width: number;
		height: number;
		url: string;
		image: HTMLImageElement;
	};
	type ModeResult = {
		url: string;
		width: number;
		height: number;
		statusMessage: string;
		errorMessage: string;
	};

	const DEFAULT_SOURCE_BRIGHTNESS = 100;
	const DEFAULT_SOURCE_CONTRAST = 20;
	const DEFAULT_HIDDEN_BRIGHTNESS = 90;
	const DEFAULT_HIDDEN_CONTRAST = 100;
	const DEFAULT_SHADOWS = {
		isColored: true,
		scaleInner: 0.3,
		scaleCover: 0.2,
		desatInner: 0,
		desatCover: 0,
		weightInner: 0.7,
		maxSize: 1200
	};

	const initialResults: Record<ToolMode, ModeResult> = {
		prism: {
			url: '',
			width: 0,
			height: 0,
			statusMessage: '请先上传原图与隐藏图，再生成输出 PNG。',
			errorMessage: ''
		},
		shadow: {
			url: '',
			width: 0,
			height: 0,
			statusMessage: '请先上传白底图与黑底图，再生成输出 PNG。',
			errorMessage: ''
		}
	};

	const modeMetaMap = {
		prism: {
			name: '光棱坦克',
			description: '保留现有棋盘格幻影图算法，适合制作需要全局拉高亮度后才更容易识别隐藏图的 PNG。',
			sourceLabel: '原图',
			hiddenLabel: '隐藏图',
			sourceCta: '点击上传原图',
			hiddenCta: '点击上传隐藏图',
			sourceHint: '支持常见图片格式，生成时将以这张图片的宽高作为最终输出尺寸。',
			hiddenHint: '隐藏图会在生成时按原图尺寸统一缩放，并参与棋盘格交错合成。',
			emptyResultHint:
				'尚未生成结果。上传两张图片并调整参数后，点击"生成图像"即可在此处预览并下载 PNG。',
			resultDescription:
				'输出为 PNG 棋盘图。该模式严格使用原始算法，不提供黑白底双预览。'
		},
		shadow: {
			name: '幻影坦克',
			description: '使用 Mirage_Colored 核心逻辑：支持全彩输出、黑白双背景预览，以及亮度/去色/权重控制。',
			sourceLabel: '白底图',
			hiddenLabel: '黑底图',
			sourceCta: '点击上传白底图',
			hiddenCta: '点击上传黑底图',
			sourceHint: '对应源码里的表图，会在生成时按黑底图的画幅进行居中裁切适配。',
			hiddenHint: '对应源码里的里图，输出尺寸和最大尺寸缩放以这张图为基准。',
			emptyResultHint:
				'尚未生成结果。上传白底图与黑底图后，点击"生成图像"即可查看同一 PNG 在白底 / 黑底下的差异。',
			resultDescription:
				'输出为单张透明 PNG，使用 Mirage_Colored 核心像素处理逻辑，并提供白底 / 黑底双预览。'
		}
	} as const;

	let mode = $state<ToolMode>('prism');
	let sourceImage = $state<LoadedImage | null>(null);
	let hiddenImage = $state<LoadedImage | null>(null);
	let outputCanvas: HTMLCanvasElement | undefined = $state();

	let sourceBrightness = $state(DEFAULT_SOURCE_BRIGHTNESS);
	let sourceContrast = $state(DEFAULT_SOURCE_CONTRAST);
	let hiddenBrightness = $state(DEFAULT_HIDDEN_BRIGHTNESS);
	let hiddenContrast = $state(DEFAULT_HIDDEN_CONTRAST);
	let isGenerating = $state(false);

	let shadowIsColored = $state(DEFAULT_SHADOWS.isColored);
	let shadowInnerScale = $state(DEFAULT_SHADOWS.scaleInner);
	let shadowCoverScale = $state(DEFAULT_SHADOWS.scaleCover);
	let shadowInnerDesat = $state(DEFAULT_SHADOWS.desatInner);
	let shadowCoverDesat = $state(DEFAULT_SHADOWS.desatCover);
	let shadowInnerWeight = $state(DEFAULT_SHADOWS.weightInner);
	let shadowMaxSize = $state(DEFAULT_SHADOWS.maxSize);

	let results = $state<Record<ToolMode, ModeResult>>(structuredClone(initialResults));
	const fileUrls = new Set<string>();

	let currentMeta = $derived(modeMetaMap[mode]);
	let currentResult = $derived(results[mode]);
	let sizeMismatch = $derived(
		sourceImage && hiddenImage
			? sourceImage.width !== hiddenImage.width || sourceImage.height !== hiddenImage.height
			: false
	);

	const clamp = (value: number, min: number, max: number) =>
		Math.min(max, Math.max(min, value));

	function updateModeResult(key: ToolMode, patch: Partial<ModeResult>) {
		results = { ...results, [key]: { ...results[key], ...patch } };
	}

	function resetModeResult(key: ToolMode) {
		updateModeResult(key, { ...initialResults[key] });
	}

	function setModeError(key: ToolMode, msg: string, statusMessage: string) {
		updateModeResult(key, { errorMessage: msg, statusMessage });
	}

	function clearModeError(key: ToolMode) {
		updateModeResult(key, { errorMessage: '' });
	}

	function getInputActionText(kind: UploadKind) {
		const image = kind === 'source' ? sourceImage : hiddenImage;
		const label = kind === 'source' ? currentMeta.sourceLabel : currentMeta.hiddenLabel;
		return image ? `更换${label}` : kind === 'source' ? currentMeta.sourceCta : currentMeta.hiddenCta;
	}

	function getInputHint(kind: UploadKind) {
		return kind === 'source' ? currentMeta.sourceHint : currentMeta.hiddenHint;
	}

	function getDownloadFileName() {
		return mode === 'prism' ? 'prism-tank.png' : 'shadow-tank.png';
	}

	function adjustPixelBrightnessContrast(
		r: number,
		g: number,
		b: number,
		brightnessFactor: number,
		contrastFactor: number
	) {
		const adjustContrast = (v: number) => clamp((v - 128) * contrastFactor + 128, 0, 255);
		return [
			adjustContrast(r * brightnessFactor),
			adjustContrast(g * brightnessFactor),
			adjustContrast(b * brightnessFactor)
		] as const;
	}

	function revokeFileUrl(url?: string) {
		if (!url) return;
		URL.revokeObjectURL(url);
		fileUrls.delete(url);
	}

	function loadImage(file: File): Promise<LoadedImage> {
		const url = URL.createObjectURL(file);
		fileUrls.add(url);
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () =>
				resolve({
					file,
					name: file.name,
					width: image.naturalWidth,
					height: image.naturalHeight,
					url,
					image
				});
			image.onerror = () => {
				revokeFileUrl(url);
				reject(new Error('图片读取失败，请更换文件后重试。'));
			};
			image.src = url;
		});
	}

	async function handleFileChange(event: Event, kind: UploadKind) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		resetModeResult(mode);

		if (!file.type.startsWith('image/')) {
			setModeError(mode, '仅支持上传图片文件。', '未满足生成条件。');
			input.value = '';
			return;
		}

		try {
			const loaded = await loadImage(file);
			if (kind === 'source') {
				revokeFileUrl(sourceImage?.url);
				sourceImage = loaded;
			} else {
				revokeFileUrl(hiddenImage?.url);
				hiddenImage = loaded;
			}
			const ready =
				mode === 'prism'
					? '图片已更新，可点击生成光棱坦克 PNG。'
					: '图片已更新，可点击生成幻影坦克 PNG。';
			const waiting =
				mode === 'prism'
					? '图片已加载，请继续上传另一张图片。'
					: '图片已加载，请继续上传另一张目标图。';
			updateModeResult(mode, {
				errorMessage: '',
				statusMessage: sourceImage && hiddenImage ? ready : waiting
			});
		} catch (e) {
			setModeError(
				mode,
				e instanceof Error ? e.message : '图片读取失败。',
				'图片加载失败。'
			);
		}
	}

	function resetPrismControls() {
		sourceBrightness = DEFAULT_SOURCE_BRIGHTNESS;
		sourceContrast = DEFAULT_SOURCE_CONTRAST;
		hiddenBrightness = DEFAULT_HIDDEN_BRIGHTNESS;
		hiddenContrast = DEFAULT_HIDDEN_CONTRAST;
		resetModeResult('prism');
		updateModeResult('prism', { statusMessage: '光棱坦克参数已重置为默认值，可重新生成图像。' });
	}

	function resetShadowControls() {
		shadowIsColored = DEFAULT_SHADOWS.isColored;
		shadowInnerScale = DEFAULT_SHADOWS.scaleInner;
		shadowCoverScale = DEFAULT_SHADOWS.scaleCover;
		shadowInnerDesat = DEFAULT_SHADOWS.desatInner;
		shadowCoverDesat = DEFAULT_SHADOWS.desatCover;
		shadowInnerWeight = DEFAULT_SHADOWS.weightInner;
		shadowMaxSize = DEFAULT_SHADOWS.maxSize;
		resetModeResult('shadow');
		updateModeResult('shadow', { statusMessage: '幻影坦克参数已重置为源码默认值，可重新生成图像。' });
	}

	function downloadResult() {
		if (!currentResult.url || !sourceImage || !hiddenImage) return;
		const link = document.createElement('a');
		link.href = currentResult.url;
		link.download = getDownloadFileName();
		link.click();
	}

	function createPrismContext(width: number, height: number) {
		if (!outputCanvas) throw new Error('Canvas 未就绪。');
		outputCanvas.width = width;
		outputCanvas.height = height;
		const outputContext = outputCanvas.getContext('2d');
		if (!outputContext) throw new Error('浏览器不支持当前 Canvas 能力。');

		const baseCanvas = document.createElement('canvas');
		baseCanvas.width = width;
		baseCanvas.height = height;
		const baseContext = baseCanvas.getContext('2d');

		const overlayCanvas = document.createElement('canvas');
		overlayCanvas.width = width;
		overlayCanvas.height = height;
		const overlayContext = overlayCanvas.getContext('2d');

		if (!baseContext || !overlayContext) throw new Error('浏览器不支持离屏 Canvas 处理。');

		baseContext.drawImage(sourceImage!.image, 0, 0, width, height);
		overlayContext.drawImage(hiddenImage!.image, 0, 0, width, height);

		return {
			outputContext,
			baseData: baseContext.getImageData(0, 0, width, height),
			overlayData: overlayContext.getImageData(0, 0, width, height)
		};
	}

	function createShadowContext() {
		if (!outputCanvas) throw new Error('Canvas 未就绪。');
		const innerImage = hiddenImage!;
		const coverImage = sourceImage!;
		let width = innerImage.width;
		let height = innerImage.height;
		const maxSize = Math.max(0, Math.floor(shadowMaxSize || 0));
		if (maxSize !== 0) {
			if (innerImage.width > innerImage.height) {
				width = maxSize;
				height = Math.ceil((innerImage.height * maxSize) / innerImage.width);
			} else {
				height = maxSize;
				width = Math.ceil((innerImage.width * maxSize) / innerImage.height);
			}
		}

		const innerCanvas = document.createElement('canvas');
		innerCanvas.width = width;
		innerCanvas.height = height;
		const innerContext = innerCanvas.getContext('2d');

		const coverCanvas = document.createElement('canvas');
		coverCanvas.width = width;
		coverCanvas.height = height;
		const coverContext = coverCanvas.getContext('2d');

		const outputContext = outputCanvas.getContext('2d');
		if (!innerContext || !coverContext || !outputContext)
			throw new Error('浏览器不支持幻影坦克所需的 Canvas 能力。');

		outputCanvas.width = width;
		outputCanvas.height = height;
		innerContext.drawImage(innerImage.image, 0, 0, width, height);

		const coverRatio = coverImage.width / coverImage.height;
		const targetRatio = width / height;
		let drawX = 0;
		let drawY = 0;
		let drawWidth = width;
		let drawHeight = height;
		if (coverRatio < targetRatio) {
			drawHeight = Math.ceil(width / coverRatio);
			drawY = Math.ceil((height - drawHeight) / 2);
		} else {
			drawWidth = Math.ceil(height * coverRatio);
			drawX = Math.ceil((width - drawWidth) / 2);
		}
		coverContext.drawImage(coverImage.image, drawX, drawY, drawWidth, drawHeight);

		return {
			width,
			height,
			outputContext,
			innerData: innerContext.getImageData(0, 0, width, height),
			coverData: coverContext.getImageData(0, 0, width, height)
		};
	}

	function convertGray(imageData: ImageData) {
		const data = imageData.data;
		const result = new Uint8ClampedArray(data.length >> 2);
		for (let i = 0; i < data.length; i += 4) {
			result[i >> 2] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
		}
		return result;
	}

	function generatePrismImage() {
		const width = sourceImage!.width;
		const height = sourceImage!.height;
		const { outputContext, baseData, overlayData } = createPrismContext(width, height);
		const result = outputContext.createImageData(width, height);

		const oBright = 1 + sourceBrightness / 100;
		const hBright = 1 - hiddenBrightness / 100;
		const oContrast = sourceContrast / 100;
		const hContrast = hiddenContrast / 100;

		for (let i = 0; i < baseData.data.length; i += 4) {
			const px = i / 4;
			const x = px % width;
			const y = Math.floor(px / width);
			let r: number, g: number, b: number;
			if ((x + y) % 2 === 0) {
				const p = adjustPixelBrightnessContrast(
					baseData.data[i],
					baseData.data[i + 1],
					baseData.data[i + 2],
					oBright,
					oContrast
				);
				r = p[0]; g = p[1]; b = p[2];
			} else {
				const p = adjustPixelBrightnessContrast(
					overlayData.data[i],
					overlayData.data[i + 1],
					overlayData.data[i + 2],
					hBright,
					hContrast
				);
				r = p[0]; g = p[1]; b = p[2];
			}
			result.data[i] = r;
			result.data[i + 1] = g;
			result.data[i + 2] = b;
			result.data[i + 3] = 255;
		}

		outputContext.putImageData(result, 0, 0);
		const url = outputCanvas!.toDataURL('image/png');
		updateModeResult('prism', {
			url,
			width,
			height,
			errorMessage: '',
			statusMessage: sizeMismatch
				? `生成完成：隐藏图已按原图尺寸 ${width} × ${height} 自动缩放，并按原始棋盘图算法输出 PNG。`
				: '生成完成：当前已按原始棋盘图算法输出 PNG。'
		});
	}

	function generateShadowImage() {
		const { width, height, outputContext, innerData, coverData } = createShadowContext();
		const innerGray = convertGray(innerData);
		const coverGray = convertGray(coverData);
		const innerPixels = innerData.data;
		const coverPixels = coverData.data;
		const outputData = new Uint8ClampedArray(innerPixels.length);
		const innerScale = shadowInnerScale;
		const coverScale = 1 - shadowCoverScale;

		if (shadowIsColored) {
			const innerCache = new Uint8ClampedArray(innerPixels.length);
			const coverCache = new Uint8ClampedArray(coverPixels.length);
			const alphaCache = new Float32Array(innerGray.length);

			for (let i = 0; i < innerPixels.length; i += 4) {
				const gray = innerGray[i >> 2] * innerScale;
				const r = innerPixels[i] * innerScale;
				const g = innerPixels[i + 1] * innerScale;
				const b = innerPixels[i + 2] * innerScale;
				innerCache[i] = r + (gray - r) * shadowInnerDesat;
				innerCache[i + 1] = g + (gray - g) * shadowInnerDesat;
				innerCache[i + 2] = b + (gray - b) * shadowInnerDesat;
			}

			for (let i = 0; i < coverPixels.length; i += 4) {
				const gray = 255 - (255 - coverGray[i >> 2]) * coverScale;
				const r = 255 - (255 - coverPixels[i]) * coverScale;
				const g = 255 - (255 - coverPixels[i + 1]) * coverScale;
				const b = 255 - (255 - coverPixels[i + 2]) * coverScale;
				coverCache[i] = r + (gray - r) * shadowCoverDesat;
				coverCache[i + 1] = g + (gray - g) * shadowCoverDesat;
				coverCache[i + 2] = b + (gray - b) * shadowCoverDesat;
			}

			for (let i = 0; i < innerGray.length; i++) {
				alphaCache[i] = Math.min(
					Math.max(
						(255 +
							innerGray[i] * innerScale -
							(255 - (255 - coverGray[i]) * coverScale)) /
							255,
						0
					),
					1
				);
			}

			for (let i = 0; i < innerPixels.length; i += 4) {
				const alpha = alphaCache[i >> 2];
				const alphaColor = 255 * alpha;
				const safeAlpha = Math.max(alpha, 0.0001);
				outputData[i] = clamp(
					((innerCache[i] - alphaColor + 255 - coverCache[i]) * shadowInnerWeight +
						alphaColor -
						255 +
						coverCache[i]) /
						safeAlpha,
					0,
					255
				);
				outputData[i + 1] = clamp(
					((innerCache[i + 1] - alphaColor + 255 - coverCache[i + 1]) * shadowInnerWeight +
						alphaColor -
						255 +
						coverCache[i + 1]) /
						safeAlpha,
					0,
					255
				);
				outputData[i + 2] = clamp(
					((innerCache[i + 2] - alphaColor + 255 - coverCache[i + 2]) * shadowInnerWeight +
						alphaColor -
						255 +
						coverCache[i + 2]) /
						safeAlpha,
					0,
					255
				);
				outputData[i + 3] = clamp(255 * alpha, 0, 255);
			}
		} else {
			for (let i = 0; i < innerGray.length; i++) {
				const inner = innerGray[i] * innerScale;
				const alpha = 255 + inner - (255 - (255 - coverGray[i]) * coverScale);
				const safeAlpha = Math.max(alpha, 0.0001);
				const color = clamp((255 * inner) / safeAlpha, 0, 255);
				outputData[i << 2] = color;
				outputData[(i << 2) + 1] = color;
				outputData[(i << 2) + 2] = color;
				outputData[(i << 2) + 3] = clamp(alpha, 0, 255);
			}
		}

		outputContext.putImageData(new ImageData(outputData, width, height), 0, 0);
		const url = outputCanvas!.toDataURL('image/png');
		updateModeResult('shadow', {
			url,
			width,
			height,
			errorMessage: '',
			statusMessage: sizeMismatch
				? `生成完成：已按黑底图基准尺寸 ${width} × ${height} 输出 Mirage_Colored PNG，白底图已完成居中裁切适配。`
				: '生成完成：当前已按 Mirage_Colored 核心算法输出透明 PNG。'
		});
	}

	function generateImage() {
		if (!sourceImage || !hiddenImage) {
			setModeError(
				mode,
				mode === 'prism' ? '请先上传原图和隐藏图。' : '请先上传白底图和黑底图。',
				'未满足生成条件。'
			);
			return;
		}
		isGenerating = true;
		clearModeError(mode);
		resetModeResult(mode);
		try {
			if (mode === 'prism') generatePrismImage();
			else generateShadowImage();
		} catch (e) {
			setModeError(
				mode,
				e instanceof Error ? e.message : '生成失败，请稍后重试。',
				'生成失败。'
			);
		} finally {
			isGenerating = false;
		}
	}

	onDestroy(() => {
		revokeFileUrl(sourceImage?.url);
		revokeFileUrl(hiddenImage?.url);
	});
</script>

<svelte:head>
	<title>光棱坦克 / 幻影坦克 - 二叉树树</title>
	<meta name="description" content="本地生成支持白底/黑底显隐效果的 PNG" />
</svelte:head>

<canvas bind:this={outputCanvas} class="hidden"></canvas>

<div class="container mx-auto max-w-6xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:layers-triple" class="size-6 text-primary" />
					光棱坦克 / 幻影坦克
				</CardTitle>
				<PageViews pathname="/ptg/" class="text-sm text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground leading-relaxed">
				同页支持光棱坦克与幻影坦克两种模式：可在浏览器本地完成双图上传、生成、预览与 PNG 下载；所有处理均在前端完成，不会上传到服务端。
			</p>
		</CardContent>
	</Card>

	<!-- 模式切换 -->
	<Card>
		<CardContent class="space-y-3 py-4">
			<Tabs value={mode} onValueChange={(v) => (mode = v as ToolMode)}>
				<TabsList>
					<TabsTrigger value="prism">{modeMetaMap.prism.name}</TabsTrigger>
					<TabsTrigger value="shadow">{modeMetaMap.shadow.name}</TabsTrigger>
				</TabsList>
			</Tabs>
			<p class="text-sm text-muted-foreground leading-relaxed">{currentMeta.description}</p>
		</CardContent>
	</Card>

	<div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
		<!-- 左：上传 + 参数 -->
		<section class="space-y-6">
			<!-- 上传 -->
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">上传图片</CardTitle>
					<p class="text-sm text-muted-foreground leading-relaxed">
						{mode === 'prism'
							? '原图会作为输出尺寸基准；如果隐藏图尺寸不同，生成时会自动缩放到原图尺寸，全程仅在浏览器本地处理。'
							: '白底图对应表图，黑底图对应里图；以黑底图为尺寸基准并对白底图做居中裁切适配。'}
					</p>
				</CardHeader>
				<CardContent>
					<div class="grid gap-4 md:grid-cols-2">
						{#each ['source', 'hidden'] as kind}
							{@const k = kind as UploadKind}
							{@const image = k === 'source' ? sourceImage : hiddenImage}
							{@const label = k === 'source' ? currentMeta.sourceLabel : currentMeta.hiddenLabel}
							<div class="space-y-3">
								<Label for="ptg-{k}-upload">{label}</Label>
								<input
									id="ptg-{k}-upload"
									type="file"
									accept="image/*"
									class="hidden"
									onchange={(e) => handleFileChange(e, k)}
								/>
								<Label
									for="ptg-{k}-upload"
									class="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 px-4 py-5 text-center transition-colors hover:border-primary hover:bg-primary/5"
								>
									<Icon icon="mdi:image-plus" class="mb-2 size-6 text-muted-foreground" />
									<span class="mb-1 text-sm font-medium">{getInputActionText(k)}</span>
									<span class="text-xs text-muted-foreground leading-relaxed">{getInputHint(k)}</span>
								</Label>
								{#if image}
									<div class="rounded-lg border bg-muted/30 p-3">
										<img
											src={image.url}
											alt="{label}预览"
											class="mb-2 max-h-44 w-full rounded-md object-contain"
										/>
										<p class="text-xs text-muted-foreground break-all">{image.name}</p>
										<p class="text-xs text-muted-foreground">{image.width} × {image.height}</p>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>

			<!-- 参数 -->
			<Card>
				<CardHeader>
					<div class="flex items-center justify-between gap-3">
						<div>
							<CardTitle class="text-lg">参数与操作</CardTitle>
							<p class="mt-1 text-sm text-muted-foreground">
								{mode === 'prism'
									? '保留纯前端亮度 / 对比度预处理，并在像素级进行棋盘格交错合成。'
									: '已接入 Mirage_Colored 默认参数与像素计算逻辑。'}
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onclick={mode === 'prism' ? resetPrismControls : resetShadowControls}
						>
							{mode === 'prism' ? '重置参数' : '恢复默认'}
						</Button>
					</div>
				</CardHeader>
				<CardContent class="space-y-5">
					{#if mode === 'prism'}
						<div class="grid gap-5 md:grid-cols-2">
							<div class="space-y-4 rounded-lg border bg-muted/30 p-4">
								<h3 class="text-sm font-semibold">原图参数</h3>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>原图亮度提高 (%)</span>
										<span class="font-mono text-foreground">{sourceBrightness}</span>
									</div>
									<Slider
										type="single"
										value={sourceBrightness}
										onValueChange={(v) => (sourceBrightness = v as number)}
										min={0}
										max={200}
										step={1}
									/>
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>原图对比度 (%)</span>
										<span class="font-mono text-foreground">{sourceContrast}</span>
									</div>
									<Slider
										type="single"
										value={sourceContrast}
										onValueChange={(v) => (sourceContrast = v as number)}
										min={10}
										max={300}
										step={1}
									/>
								</div>
							</div>

							<div class="space-y-4 rounded-lg border bg-muted/30 p-4">
								<h3 class="text-sm font-semibold">隐藏图参数</h3>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>隐藏图亮度降低 (%)</span>
										<span class="font-mono text-foreground">{hiddenBrightness}</span>
									</div>
									<Slider
										type="single"
										value={hiddenBrightness}
										onValueChange={(v) => (hiddenBrightness = v as number)}
										min={0}
										max={100}
										step={1}
									/>
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>隐藏图对比度 (%)</span>
										<span class="font-mono text-foreground">{hiddenContrast}</span>
									</div>
									<Slider
										type="single"
										value={hiddenContrast}
										onValueChange={(v) => (hiddenContrast = v as number)}
										min={10}
										max={300}
										step={1}
									/>
								</div>
							</div>
						</div>
					{:else}
						<div class="grid gap-5 md:grid-cols-2">
							<div class="space-y-4 rounded-lg border bg-muted/30 p-4">
								<div class="flex items-center justify-between gap-3">
									<Label for="shadow-colored" class="text-sm font-semibold">全彩输出</Label>
									<Switch id="shadow-colored" bind:checked={shadowIsColored} />
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>黑底图缩放</span>
										<span class="font-mono text-foreground">{shadowInnerScale.toFixed(2)}</span>
									</div>
									<Slider
										type="single"
										value={shadowInnerScale}
										onValueChange={(v) => (shadowInnerScale = v as number)}
										min={0}
										max={1}
										step={0.02}
									/>
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>黑底图去色</span>
										<span class="font-mono text-foreground">{shadowInnerDesat.toFixed(2)}</span>
									</div>
									<Slider
										type="single"
										value={shadowInnerDesat}
										onValueChange={(v) => (shadowInnerDesat = v as number)}
										min={0}
										max={1}
										step={0.02}
									/>
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>黑底图混合权重</span>
										<span class="font-mono text-foreground">{shadowInnerWeight.toFixed(2)}</span>
									</div>
									<Slider
										type="single"
										value={shadowInnerWeight}
										onValueChange={(v) => (shadowInnerWeight = v as number)}
										min={0}
										max={1}
										step={0.02}
									/>
								</div>
							</div>

							<div class="space-y-4 rounded-lg border bg-muted/30 p-4">
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>白底图缩放</span>
										<span class="font-mono text-foreground">{shadowCoverScale.toFixed(2)}</span>
									</div>
									<Slider
										type="single"
										value={shadowCoverScale}
										onValueChange={(v) => (shadowCoverScale = v as number)}
										min={0}
										max={1}
										step={0.02}
									/>
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>白底图去色</span>
										<span class="font-mono text-foreground">{shadowCoverDesat.toFixed(2)}</span>
									</div>
									<Slider
										type="single"
										value={shadowCoverDesat}
										onValueChange={(v) => (shadowCoverDesat = v as number)}
										min={0}
										max={1}
										step={0.02}
									/>
								</div>
								<div class="space-y-2">
									<div class="flex items-center justify-between text-sm text-muted-foreground">
										<span>最大输出尺寸</span>
										<span class="font-mono text-foreground">{shadowMaxSize}</span>
									</div>
									<Slider
										type="single"
										value={shadowMaxSize}
										onValueChange={(v) => (shadowMaxSize = v as number)}
										min={0}
										max={4096}
										step={1}
									/>
									<p class="text-xs text-muted-foreground leading-relaxed">
										0 表示不限制；非 0 时会按黑底图长边缩放输出。
									</p>
								</div>
							</div>
						</div>
					{/if}

					<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
						<Button
							onclick={generateImage}
							disabled={!sourceImage || !hiddenImage || isGenerating}
						>
							{#if isGenerating}
								<Icon icon="mdi:loading" class="size-4 animate-spin" />
								正在生成...
							{:else}
								<Icon icon="mdi:image-multiple" class="size-4" />
								生成图像
							{/if}
						</Button>
						{#if currentResult.url}
							<Button variant="outline" onclick={downloadResult}>
								<Icon icon="mdi:download" class="size-4" />
								下载 PNG
							</Button>
						{/if}
					</div>
				</CardContent>
			</Card>
		</section>

		<!-- 右：结果 -->
		<section>
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">生成结果</CardTitle>
					<p class="text-sm text-muted-foreground leading-relaxed">
						{currentMeta.resultDescription}
					</p>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if currentResult.errorMessage}
						<Alert variant="destructive">
							<Icon icon="mdi:alert-circle-outline" />
							<AlertDescription>{currentResult.errorMessage}</AlertDescription>
						</Alert>
					{/if}

					<div class="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
						{currentResult.statusMessage}
					</div>

					{#if sizeMismatch}
						<Alert>
							<Icon icon="mdi:alert" />
							<AlertDescription>
								{mode === 'prism'
									? `检测到两张图片尺寸不一致：当前会按原图尺寸 ${sourceImage?.width} × ${sourceImage?.height} 统一缩放隐藏图后再生成。`
									: '检测到两张图片尺寸不一致：当前会按黑底图尺寸基准生成，并对白底图执行居中裁切适配。'}
							</AlertDescription>
						</Alert>
					{/if}

					{#if currentResult.url}
						{#if mode === 'prism'}
							<div class="rounded-lg border bg-muted/30 p-3">
								<p class="mb-2 text-sm font-medium">输出预览</p>
								<img
									src={currentResult.url}
									alt="光棱坦克输出预览"
									class="w-full rounded-md object-contain"
								/>
							</div>
						{:else}
							<div class="grid gap-3 lg:grid-cols-2">
								<div class="rounded-lg border bg-white p-3">
									<p class="mb-2 text-sm font-medium text-black/75">白底预览</p>
									<img
										src={currentResult.url}
										alt="幻影坦克白底预览"
										class="w-full rounded-md object-contain"
									/>
								</div>
								<div class="rounded-lg border bg-black p-3">
									<p class="mb-2 text-sm font-medium text-white/80">黑底预览</p>
									<img
										src={currentResult.url}
										alt="幻影坦克黑底预览"
										class="w-full rounded-md object-contain"
									/>
								</div>
							</div>
						{/if}
						<p class="text-xs text-muted-foreground">
							输出尺寸：{currentResult.width} × {currentResult.height}
						</p>
					{:else}
						<div
							class="flex min-h-[20rem] items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 px-6 text-center text-sm text-muted-foreground leading-relaxed"
						>
							{currentMeta.emptyResultHint}
						</div>
					{/if}
				</CardContent>
			</Card>
		</section>
	</div>
</div>
