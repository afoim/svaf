<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import Content, { metadata as rawMetadata } from '../../content/announcement/index.md';
	import { onMount } from 'svelte';

	const metadata = (rawMetadata ?? {}) as {
		enable?: boolean;
		level?: 'info' | 'note' | 'tip' | 'important' | 'warning' | 'caution' | 'happy';
	};

	const iconPathMap: Record<string, string> = {
		info: 'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
		note: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
		tip: 'M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.751.751 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z',
		important:
			'M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v9.5A1.75 1.75 0 0 1 14.25 13H8.06l-2.573 2.573A1.458 1.458 0 0 1 3 14.543V13H1.75A1.75 1.75 0 0 1 0 11.25Zm1.75-.25a.25.25 0 0 0-.25.25v9.5c0 .138.112.25.25.25h2a.75.75 0 0 1 .75.75v2.19l2.72-2.72a.749.749 0 0 1 .53-.22h6.5a.25.25 0 0 0 .25-.25v-9.5a.25.25 0 0 0-.25-.25Zm7 2.25v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 9a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
		warning:
			'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
		caution:
			'M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z'
	};

	const colorMap: Record<string, string> = {
		info: '#0969da',
		note: '#0969da',
		tip: '#1a7f37',
		happy: 'transparent',
		caution: '#cf222e',
		warning: '#9a6700',
		important: '#8250df'
	};

	const enable = metadata.enable ?? false;
	const level = metadata.level ?? 'info';
	const isHappy = level === 'happy';
	const currentIconPath = iconPathMap[level] || iconPathMap.info;
	const currentColor = colorMap[level] || colorMap.info;

	let isVisible = $state(false);
	let shouldRender = $state(false);
	let closeBtnRef: HTMLButtonElement | undefined = $state();

	const STORAGE_KEY = 'announcement-closed';
	const ANIMATION_DURATION = 350;

	function wasClosed(): boolean {
		if (typeof window === 'undefined') return false;
		try {
			const closed = localStorage.getItem(STORAGE_KEY);
			if (!closed) return false;
			const closedTime = parseInt(closed, 10);
			const twentyFourHours = 24 * 60 * 60 * 1000;
			return Date.now() - closedTime < twentyFourHours;
		} catch {
			return false;
		}
	}

	function handleClose() {
		isVisible = false;
		try {
			localStorage.setItem(STORAGE_KEY, Date.now().toString());
		} catch {
			// localStorage not available
		}
	}

	onMount(() => {
		if (!enable || wasClosed()) return;

		shouldRender = true;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				isVisible = true;
			});
		});
	});
</script>

{#if shouldRender}
	<div
		class="announcement-popup"
		class:announcement-visible={isVisible}
		role="alert"
		aria-live="polite"
	>
		<Card
			class={`announcement-card ${isHappy ? 'announcement-happy' : ''}`}
			style={isHappy ? '' : `border-color: ${currentColor};`}
		>
			<CardContent class="flex items-center gap-3 relative">
				<button
					bind:this={closeBtnRef}
					type="button"
					class="announcement-close-btn"
					onclick={handleClose}
					aria-label="关闭公告"
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
				<div
					class="flex shrink-0 items-center justify-center"
					style={isHappy ? '' : `color: ${currentColor};`}
				>
					{#if isHappy}
						<span class="announcement-emoji" aria-hidden="true">🎉</span>
					{:else}
						<svg width="24" height="24" viewBox="0 0 16 16" aria-hidden="true">
							<path d={currentIconPath} fill="currentColor"></path>
						</svg>
					{/if}
				</div>
				<div class="grow">
					<div
						class="announcement-text prose prose-neutral dark:prose-invert max-w-none text-sm md:text-base
							prose-headings:text-foreground prose-headings:my-0
							prose-p:text-foreground prose-p:my-0
							prose-strong:text-foreground
							prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80
							prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-blockquote:my-0
							prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none
							prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-foreground prose-pre:my-0
							prose-hr:border-border
							prose-ul:my-0 prose-ol:my-0 prose-li:my-0
							prose-img:rounded-lg prose-img:my-0"
						style={isHappy ? '' : `color: ${currentColor};`}
					>
						<Content />
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}

<style>
	.announcement-popup {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 9999;
		max-width: 480px;
		width: calc(100vw - 32px);
		transform: translateX(-100%);
		opacity: 0;
		transition: transform 350ms ease-out, opacity 350ms ease-out;
		pointer-events: none;
	}

	.announcement-popup.announcement-visible {
		transform: translateX(0);
		opacity: 1;
		pointer-events: auto;
	}

	.announcement-card {
		margin: 16px;
		box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.2);
	}

	.announcement-close-btn {
		position: absolute;
		top: 8px;
		left: 8px;
		width: 32px;
		height: 32px;
		min-width: 24px;
		min-height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		color: var(--muted-foreground, #666);
		transition: background-color 150ms ease, color 150ms ease;
		z-index: 1;
	}

	.announcement-close-btn:hover {
		background: var(--muted, #f0f0f0);
		color: var(--foreground, #333);
	}

	.announcement-close-btn:focus-visible {
		outline: 2px solid var(--ring, #888);
		outline-offset: 2px;
	}

	.announcement-close-btn:active {
		transform: scale(0.95);
	}

	@keyframes rainbow-flow {
		0% {
			background-position: 0% 50%;
		}
		100% {
			background-position: 200% 50%;
		}
	}

	:global(.announcement-happy) {
		--notice-gradient: linear-gradient(
			90deg,
			oklch(0.78 0.18 0),
			oklch(0.78 0.18 45),
			oklch(0.78 0.18 90),
			oklch(0.78 0.18 135),
			oklch(0.78 0.18 180),
			oklch(0.78 0.18 225),
			oklch(0.78 0.18 270),
			oklch(0.78 0.18 315),
			oklch(0.78 0.18 360)
		);
		border: 2px solid transparent !important;
		background:
			linear-gradient(hsl(var(--card)), hsl(var(--card))) padding-box,
			var(--notice-gradient) border-box !important;
		background-size:
			100% 100%,
			200% 100% !important;
		animation: rainbow-flow 3s linear infinite;
	}

	.announcement-happy .announcement-text {
		background: var(--notice-gradient);
		background-size: 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: rainbow-flow 3s linear infinite;
	}

	.announcement-emoji {
		font-size: 1.5rem;
		line-height: 1;
	}

	.announcement-text :global(p) {
		margin: 0;
	}

	:global(.announcement-happy) .announcement-text :global(*) {
		background: var(--notice-gradient);
		background-size: 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: rainbow-flow 3s linear infinite;
	}

	@media (max-width: 480px) {
		.announcement-popup {
			width: calc(100vw - 16px);
		}

		.announcement-card {
			margin: 8px;
		}
	}
</style>
