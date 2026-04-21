<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config/site';

	onMount(() => {
		// 百度统计
		const loadBaidu = () => {
			if (window.__baiduAnalyticsLoaded) return;
			window.__baiduAnalyticsLoaded = true;
			window._hmt = window._hmt || [];
			
			const hm = document.createElement('script');
			hm.src = 'https://hm.baidu.com/hm.js?a87028bb5a1ed77d98f192bc12b56142';
			hm.async = true;
			document.head.appendChild(hm);
		};

		// Google 第三方脚本
		const loadGoogle = () => {
			if (window.__googleThirdPartyDeferredLoaded) return;
			window.__googleThirdPartyDeferredLoaded = true;
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

			const loadScript = (src: string, attrs: Record<string, any> = {}) => {
				const script = document.createElement('script');
				script.src = src;
				script.async = true;
				Object.entries(attrs).forEach(([key, value]) => {
					if (value === true) script.setAttribute(key, '');
					else if (value !== false && value != null) script.setAttribute(key, String(value));
				});
				document.head.appendChild(script);
			};

			loadScript('https://www.googletagmanager.com/gtm.js?id=GTM-P8V8663M');
			loadScript('https://www.googletagmanager.com/gtag/js?id=G-RBZVQJCV26');

			window.gtag = window.gtag || function () {
				window.dataLayer.push(arguments);
			};
			window.gtag('js', new Date());
			window.gtag('config', 'G-RBZVQJCV26');

			loadScript('https://fundingchoicesmessages.google.com/i/pub-1683686345039700?ers=1');
			loadScript(
				'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1683686345039700',
				{ crossorigin: 'anonymous' }
			);
		};

		// Microsoft Clarity
		const loadClarity = () => {
			if (window.__clarityLoaded) return;
			window.__clarityLoaded = true;
			
			(function(c: any,l: any,a: any,r: any,i: any,t: any,y: any){
				c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
				t=l.createElement(r);
				t.async=1;
				t.src="https://www.clarity.ms/tag/"+i;
				y=l.getElementsByTagName(r)[0];
				y.parentNode.insertBefore(t,y);
			})(window, document, "clarity", "script", "v94yrasi99");
		};

		// 延迟加载统计脚本
		if ('requestIdleCallback' in window) {
			window.requestIdleCallback(() => {
				loadBaidu();
				loadGoogle();
				loadClarity();
			}, { timeout: 4000 });
		} else {
			setTimeout(() => {
				loadBaidu();
				loadGoogle();
				loadClarity();
			}, 2000);
		}
	});
</script>

<svelte:head>
	<!-- Umami Analytics -->
	<script defer src="https://t.2x.nz/tracker.js"></script>
	<script
		defer
		src="https://u.2x.nz/script.js"
		data-website-id="5d710dbd-3a2e-43e3-a553-97b415090c63"
	></script>
	
	<!-- Cloudflare Insights -->
	<script
		defer
		src="https://static.cloudflareinsights.com/beacon.min.js"
		data-cf-beacon={JSON.stringify({ token: '15fe148e91b34f10a15652e1a74ab26c' })}
	></script>
</svelte:head>

<!-- Google Tag Manager (noscript) -->
<noscript>
	<iframe
		src="https://www.googletagmanager.com/ns.html?id=GTM-P8V8663M"
		height="0"
		width="0"
		style="display:none;visibility:hidden"
		title="Google Tag Manager"
	></iframe>
</noscript>
