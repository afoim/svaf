<script lang="ts">
	import { onMount } from 'svelte';
</script>

<svelte:head>
	<!-- Cookie Consent CSS -->
	<link
		rel="stylesheet"
		href="https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.css"
	/>

	<!-- Cookie Consent by TermsFeed -->
	<script src="//www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js"></script>
	<script>
		document.addEventListener('DOMContentLoaded', function () {
			cookieconsent.run({
				"notice_banner_type": "interstitial",
				"consent_type": "implied",
				"palette": "light",
				"language": "zh_tw",
				"page_load_consent_levels": ["strictly-necessary", "functionality", "tracking", "targeting"],
				"notice_banner_reject_button_hide": false,
				"preferences_center_close_button_hide": false,
				"page_refresh_confirmation_buttons": false,
				"website_name": "《二叉树树》官网",
				"website_privacy_policy_url": "https://2x.nz/posts/privacy-policy/"
			});
		});
	</script>

	<!-- Umami -->
	<script
		type="text/plain"
		data-cookie-consent="strictly-necessary"
		defer
		src="https://u.2x.nz/script.js"
		data-website-id="5d710dbd-3a2e-43e3-a553-97b415090c63"
	></script>

	<!-- Baidu Analytics -->
	<script type="text/plain" data-cookie-consent="tracking">
		var _hmt = _hmt || [];
		(function() {
			var hm = document.createElement("script");
			hm.src = "https://hm.baidu.com/hm.js?a87028bb5a1ed77d98f192bc12b56142";
			var s = document.getElementsByTagName("script")[0];
			s.parentNode.insertBefore(hm, s);
		})();
	</script>

	<!-- Cloudflare Web Analytics -->
	<script
		type="text/plain"
		data-cookie-consent="strictly-necessary"
		defer
		src="https://static.cloudflareinsights.com/beacon.min.js"
		data-cf-beacon={JSON.stringify({ token: '15fe148e91b34f10a15652e1a74ab26c' })}
	></script>

	<!-- Google Analytics -->
	<script
		type="text/plain"
		data-cookie-consent="tracking"
		async
		src="https://www.googletagmanager.com/gtag/js?id=G-RBZVQJCV26"
	></script>
	<script type="text/plain" data-cookie-consent="tracking">
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());
		gtag('config', 'G-RBZVQJCV26');
	</script>

	<!-- Microsoft Clarity -->
	<script type="text/plain" data-cookie-consent="tracking">
		(function(c,l,a,r,i,t,y) {
			c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
			t=l.createElement(r);
			t.async=1;
			t.src="https://www.clarity.ms/tag/"+i;
			y=l.getElementsByTagName(r)[0];
			y.parentNode.insertBefore(t,y);
		})(window, document, "clarity", "script", "v94yrasi99");
	</script>

	<!-- Google AdSense -->
	<script
		type="text/plain"
		data-cookie-consent="targeting"
		async
		src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1683686345039700"
		crossorigin="anonymous"
	></script>
</svelte:head>
