<script lang="ts">
	declare global {
		interface Window { turnstile?: { render: (c: HTMLElement, opts: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id?: string) => void }; }
	}

	let {
		siteKey,
		onToken,
		onExpired
	}: {
		siteKey: string;
		onToken: (token: string) => void;
		onExpired?: () => void;
	} = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let widgetId = $state<string | null>(null);

	$effect(() => {
		if (!siteKey || !containerEl) return;
		const container = containerEl;
		container.innerHTML = '';

		function renderWidget() {
			if (typeof window === 'undefined' || !window.turnstile || !container) return;
			try {
				widgetId = window.turnstile.render(container, {
					sitekey: siteKey,
					callback: (token: string) => onToken(token),
					['expired-callback']: () => {
						widgetId = null;
						onExpired?.();
					}
				});
			} catch { /* ignore */ }
		}

		if (window.turnstile) {
			renderWidget();
		} else {
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
			script.async = true;
			script.defer = true;
			script.onload = renderWidget;
			document.head.appendChild(script);
		}

		return () => {
			if (widgetId && window.turnstile) {
				try { window.turnstile.remove(widgetId); } catch { /* ignore */ }
			}
		};
	});
</script>

<div bind:this={containerEl} class="cf-turnstile"></div>
