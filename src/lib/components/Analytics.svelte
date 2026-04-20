<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config/site';

	onMount(() => {
		// Cookie Consent 加载
		if (!window.__cookieConsentScriptLoaded) {
			window.__cookieConsentScriptLoaded = true;
			const script = document.createElement('script');
			script.src = 'https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js';
			script.charset = 'UTF-8';
			script.async = true;
			document.head.appendChild(script);
		}

		// Cookie Consent 配置
		const runCookieConsent = () => {
			const cc = window.cookieconsent;
			if (!cc || typeof cc.run !== 'function') {
				requestAnimationFrame(runCookieConsent);
				return;
			}

			cc.run({
				notice_banner_type: 'simple',
				consent_type: 'express',
				language: 'zh-TW',
				page_load_consent_levels: ['strictly-necessary'],
				notice_banner_reject_button_hide: false,
				preferences_center_close_button_hide: false,
				page_refresh_confirmation_buttons: false,
				website_name: siteConfig.title,
				website_privacy_policy_url: `${siteConfig.url}/posts/privacy-policy/`,
				palette: 'dark'
			});
		};

		runCookieConsent();

		// 百度统计
		window._hmt = window._hmt || [];
		if (!window.__baiduAnalyticsLoaded) {
			window.__baiduAnalyticsLoaded = true;
			const hm = document.createElement('script');
			hm.src = 'https://hm.baidu.com/hm.js?a87028bb5a1ed77d98f192bc12b56142';
			hm.async = true;
			document.head.appendChild(hm);
		}

		// Google 第三方脚本
		if (!window.__googleThirdPartyDeferredLoaded) {
			window.__googleThirdPartyDeferredLoaded = true;
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

			const loadScript = (src, attrs = {}) => {
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
		}
	});
</script>

<svelte:head>
	<!-- 必要追踪脚本 -->
	<script
		data-cookie-consent="strictly-necessary"
		defer
		src="https://t.2x.nz/tracker.js"
	></script>
	<script
		type="text/plain"
		data-cookie-consent="strictly-necessary"
		defer
		src="https://u.2x.nz/script.js"
		data-website-id="5d710dbd-3a2e-43e3-a553-97b415090c63"
	></script>
	<script
		data-cookie-consent="strictly-necessary"
		defer
		src="https://static.cloudflareinsights.com/beacon.min.js"
		data-cf-beacon={JSON.stringify({ token: '15fe148e91b34f10a15652e1a74ab26c' })}
	></script>

	<!-- Clarity -->
	<script type="text/plain" data-cookie-consent="tracking">
		{`(function(c,l,a,r,i,t,y){
			c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
			t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
			y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
		})(window, document, "clarity", "script", "v94yrasi99");`}
	</script>
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
