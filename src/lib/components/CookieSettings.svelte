<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	function openCookieSettings() {
		if (window.cookieconsent && typeof window.cookieconsent.openPreferencesCenter === 'function') {
			window.cookieconsent.openPreferencesCenter();
		} else {
			console.warn('Cookie Consent 尚未加载完成');
		}
	}
</script>

<button
	onclick={openCookieSettings}
	class="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
	aria-label="Cookie 设置"
	title="Cookie 设置"
>
	<Icon icon="mdi:cookie-settings" class="w-5 h-5" />
</button>
