<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	const DASH_SRC = 'https://cdn.dashjs.org/latest/dash.all.min.js';

	let loaderPromise: Promise<void> | null = null;

	function needsDash(): boolean {
		return !!document.querySelector(
			'video[data-dashjs-player], [data-dashjs], video source[type="application/dash+xml"]'
		);
	}

	function loadDash(): Promise<void> {
		if (typeof window === 'undefined') return Promise.resolve();
		// @ts-expect-error global injected by dash.js
		if (window.dashjs) return Promise.resolve();
		if (loaderPromise) return loaderPromise;

		loaderPromise = new Promise((resolve, reject) => {
			const existing = document.querySelector<HTMLScriptElement>(
				'script[data-dashjs-loader]'
			);
			if (existing) {
				existing.addEventListener('load', () => resolve(), { once: true });
				existing.addEventListener('error', () => reject(new Error('dash.js load failed')), {
					once: true
				});
				return;
			}
			const script = document.createElement('script');
			script.src = DASH_SRC;
			script.async = true;
			script.setAttribute('data-dashjs-loader', '');
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('dash.js load failed'));
			document.body.appendChild(script);
		});

		return loaderPromise;
	}

	function initPlayers() {
		// @ts-expect-error global injected by dash.js
		const dashjs = window.dashjs;
		if (!dashjs) return;
		const videos = document.querySelectorAll<HTMLVideoElement>(
			'video[data-dashjs-player]:not([data-dashjs-initialized])'
		);
		videos.forEach((video) => {
			const src =
				video.getAttribute('src') ||
				video.querySelector('source[type="application/dash+xml"]')?.getAttribute('src') ||
				'';
			if (!src) return;
			try {
				const player = dashjs.MediaPlayer().create();
				player.initialize(video, src, video.autoplay);
				video.setAttribute('data-dashjs-initialized', '');
			} catch (e) {
				console.error('[dash.js] init failed', e);
			}
		});
	}

	async function ensureDash() {
		if (typeof window === 'undefined') return;
		if (!needsDash()) return;
		try {
			await loadDash();
			initPlayers();
		} catch (e) {
			console.error(e);
		}
	}

	onMount(() => {
		ensureDash();
	});

	afterNavigate(() => {
		ensureDash();
	});
</script>
