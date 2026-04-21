<script lang="ts">
	import { onMount } from 'svelte';

	let loaded = $state(false);

	onMount(() => {
		// 监听 Cookie Consent 更新事件
		const handleConsentUpdate = (e: CustomEvent) => {
			const preferences = e.detail;
			if (preferences.functional && !loaded) {
				loadGiscus();
				loaded = true;
			}
		};

		window.addEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);

		return () => {
			window.removeEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);
		};
	});

	function loadGiscus() {
		const script = document.createElement('script');
		script.src = 'https://giscus.app/client.js';
		script.setAttribute('data-repo', 'afoim/giscus-fuwari');
		script.setAttribute('data-repo-id', 'R_kgDOOi8quw');
		script.setAttribute('data-category', 'Announcements');
		script.setAttribute('data-category-id', 'DIC_kwDOOi8qu84CprDV');
		script.setAttribute('data-mapping', 'pathname');
		script.setAttribute('data-strict', '1');
		script.setAttribute('data-reactions-enabled', '1');
		script.setAttribute('data-emit-metadata', '0');
		script.setAttribute('data-input-position', 'top');
		script.setAttribute('data-theme', 'light_protanopia');
		script.setAttribute('data-lang', 'zh-CN');
		script.setAttribute('data-loading', 'lazy');
		script.setAttribute('crossorigin', 'anonymous');
		script.async = true;

		const container = document.getElementById('giscus-container');
		if (container) {
			container.appendChild(script);
		}
	}
</script>

<div id="giscus-container" class="mt-12">
	{#if !loaded}
		<div class="text-center text-muted-foreground py-8">
			<p>评论功能需要启用功能性 Cookie</p>
			<p class="text-sm mt-2">
				请在 <a href="#" id="open_preferences_center" class="text-primary underline">Cookie 设置</a> 中启用
			</p>
		</div>
	{/if}
</div>