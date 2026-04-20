<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		// 创建 Giscus 脚本
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

		// 将脚本添加到容器
		const container = document.getElementById('giscus-container');
		if (container) {
			container.appendChild(script);
		}

		return () => {
			// 清理
			if (container) {
				container.innerHTML = '';
			}
		};
	});
</script>

<div id="giscus-container" class="mt-12"></div>