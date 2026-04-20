<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config/site';

	onMount(() => {
		// Cookie Consent 加载
		const loadCookieConsent = () => {
			if (window.__cookieConsentScriptLoaded) return;
			window.__cookieConsentScriptLoaded = true;
			
			const script = document.createElement('script');
			script.src = 'https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js';
			script.charset = 'UTF-8';
			script.async = true;
			
			script.onload = () => {
				// 脚本加载完成后运行配置
				setTimeout(runCookieConsent, 100);
			};
			
			document.head.appendChild(script);
		};

		// Cookie Consent 配置
		const runCookieConsent = () => {
			const cc = window.cookieconsent;
			if (!cc || typeof cc.run !== 'function') {
				setTimeout(runCookieConsent, 100);
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

		loadCookieConsent();

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
		};

		// Microsoft Clarity（仅在用户同意 tracking 后加载）
		const loadClarity = () => {
			// 检查用户是否同意 tracking cookies
			const checkConsent = () => {
				const cc = window.cookieconsent;
				if (!cc) return false;
				
				// 获取用户的同意级别
				const consent = cc.get?.() || {};
				return consent.level?.includes?.('tracking') || false;
			};
			
			if (!checkConsent()) {
				console.log('[Analytics] Clarity 未加载：用户未同意 tracking cookies');
				return;
			}
			
			if (window.__clarityLoaded) return;
			window.__clarityLoaded = true;
			
			(function(c,l,a,r,i,t,y){
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
				// 延迟加载 Clarity，确保 Cookie Consent 已初始化
				setTimeout(loadClarity, 1000);
			}, { timeout: 4000 });
		} else {
			setTimeout(() => {
				loadBaidu();
				loadGoogle();
				setTimeout(loadClarity, 1000);
			}, 2000);
		}
	});
</script>

<svelte:head>
	<!-- Cookie Consent CSS -->
	<link
		rel="stylesheet"
		href="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.css"
	/>

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
