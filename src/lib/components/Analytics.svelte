<script lang="ts">
	import { onMount } from 'svelte';

	interface ConsentPreferences {
		necessary: boolean;
		functional: boolean;
		analytics: boolean;
		marketing: boolean;
	}

	let scriptsLoaded = $state({
		umami: false,
		cloudflare: false,
		baidu: false,
		google: false,
		clarity: false,
		adsense: false
	});

	onMount(() => {
		// 监听 Cookie Consent 更新事件
		const handleConsentUpdate = (e: CustomEvent<ConsentPreferences>) => {
			const preferences = e.detail;
			loadTrackers(preferences);
		};

		window.addEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);

		return () => {
			window.removeEventListener('cookie-consent-updated', handleConsentUpdate as EventListener);
		};
	});

	function loadTrackers(preferences: ConsentPreferences) {
		// 必要追踪器（始终加载）
		if (!scriptsLoaded.umami) {
			loadUmami();
			scriptsLoaded.umami = true;
		}

		if (!scriptsLoaded.cloudflare) {
			loadCloudflare();
			scriptsLoaded.cloudflare = true;
		}

		// 功能性追踪器
		// Giscus 由其自己的组件管理

		// 分析追踪器
		if (preferences.analytics) {
			if (!scriptsLoaded.baidu) {
				loadBaidu();
				scriptsLoaded.baidu = true;
			}

			if (!scriptsLoaded.google) {
				loadGoogle();
				scriptsLoaded.google = true;
			}

			if (!scriptsLoaded.clarity) {
				loadClarity();
				scriptsLoaded.clarity = true;
			}
		}

		// 营销追踪器
		if (preferences.marketing) {
			if (!scriptsLoaded.adsense) {
				loadAdSense();
				scriptsLoaded.adsense = true;
			}
		}
	}

	function loadUmami() {
		const script = document.createElement('script');
		script.defer = true;
		script.src = 'https://u.2x.nz/script.js';
		script.setAttribute('data-website-id', '5d710dbd-3a2e-43e3-a553-97b415090c63');
		document.head.appendChild(script);
	}

	function loadCloudflare() {
		const script = document.createElement('script');
		script.defer = true;
		script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
		script.setAttribute('data-cf-beacon', JSON.stringify({ token: '15fe148e91b34f10a15652e1a74ab26c' }));
		document.head.appendChild(script);
	}

	function loadBaidu() {
		const script = document.createElement('script');
		script.innerHTML = `
			var _hmt = _hmt || [];
			(function() {
				var hm = document.createElement("script");
				hm.src = "https://hm.baidu.com/hm.js?a87028bb5a1ed77d98f192bc12b56142";
				var s = document.getElementsByTagName("script")[0];
				s.parentNode.insertBefore(hm, s);
			})();
		`;
		document.head.appendChild(script);
	}

	function loadGoogle() {
		// 加载 gtag.js
		const gtagScript = document.createElement('script');
		gtagScript.async = true;
		gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-RBZVQJCV26';
		document.head.appendChild(gtagScript);

		// 初始化 Google Analytics
		const initScript = document.createElement('script');
		initScript.innerHTML = `
			window.dataLayer = window.dataLayer || [];
			function gtag(){dataLayer.push(arguments);}
			gtag('js', new Date());
			gtag('config', 'G-RBZVQJCV26');
		`;
		document.head.appendChild(initScript);
	}

	function loadClarity() {
		const script = document.createElement('script');
		script.innerHTML = `
			(function(c,l,a,r,i,t,y){
				c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
				t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
				y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
			})(window, document, "clarity", "script", "v94yrasi99");
		`;
		document.head.appendChild(script);
	}

	function loadAdSense() {
		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1683686345039700';
		script.crossOrigin = 'anonymous';
		document.head.appendChild(script);
	}
</script>
