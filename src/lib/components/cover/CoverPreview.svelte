<script lang="ts">
	type Ratio = { label: string; w: number; h: number; checked: boolean };

	let {
		svgContainer = $bindable(),
		canvasWidth,
		canvasHeight,
		visualRatios,
		bgImage,
		bgImageX,
		bgImageY,
		bgImageScale,
		bgBlur,
		bgOpacity,
		bgColor,
		bgColorOpacity,
		leftText,
		rightText,
		fontSize,
		fontWeight,
		customFontName,
		color,
		textShadow,
		gap,
		showIcon,
		iconSvg,
		localIcon,
		iconSize,
		iconBgPadding,
		iconBgEnabled,
		iconBgColor,
		iconBgOpacity,
		iconBgBlur,
		iconBgRadius,
		useOriginalIconColor,
		iconColor,
		iconShadow,
		iconRadius,
		isDragging,
		hexToRgba,
		onPointerDown,
		onPointerMove,
		onPointerUp,
		onWheel
	}: {
		svgContainer: SVGSVGElement;
		canvasWidth: number;
		canvasHeight: number;
		visualRatios: Ratio[];
		bgImage: string | null;
		bgImageX: number;
		bgImageY: number;
		bgImageScale: number;
		bgBlur: number;
		bgOpacity: number;
		bgColor: string;
		bgColorOpacity: number;
		leftText: string;
		rightText: string;
		fontSize: number;
		fontWeight: number;
		customFontName: string;
		color: string;
		textShadow: { x: number; y: number; blur: number; color: string; alpha: number };
		gap: number;
		showIcon: boolean;
		iconSvg: string;
		localIcon: string | null;
		iconSize: number;
		iconBgPadding: number;
		iconBgEnabled: boolean;
		iconBgColor: string;
		iconBgOpacity: number;
		iconBgBlur: number;
		iconBgRadius: number;
		useOriginalIconColor: boolean;
		iconColor: string;
		iconShadow: { x: number; y: number; blur: number; color: string; alpha: number };
		iconRadius: number;
		isDragging: boolean;
		hexToRgba: (hex: string, alpha: number) => string;
		onPointerDown: (e: PointerEvent) => void;
		onPointerMove: (e: PointerEvent) => void;
		onPointerUp: (e: PointerEvent) => void;
		onWheel: (e: WheelEvent) => void;
	} = $props();

	const BASE_HEIGHT = 600;
</script>

<div
	class="w-full overflow-hidden flex justify-center bg-card p-4 rounded-xl select-none touch-none"
	role="button"
	tabindex="0"
	onpointerdown={onPointerDown}
	onpointermove={onPointerMove}
	onpointerup={onPointerUp}
	onpointercancel={onPointerUp}
	onpointerleave={onPointerUp}
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
		onwheel={onWheel}
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
