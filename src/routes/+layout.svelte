<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config/site';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import ShortLinkRedirect from '$lib/components/ShortLinkRedirect.svelte';
	import DashLoader from '$lib/components/DashLoader.svelte';

	let { children } = $props();

	// 文章详情页自己输出 og:image / twitter:image / og:title 等，避免重复
	let isPostDetail = $derived(/^\/posts\/[^/]+\/?$/.test($page.url.pathname));
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
	<link rel="icon" href={siteConfig.icon} />
	<meta name="description" content={siteConfig.description} />
	<meta name="keywords" content={siteConfig.keywords.join(', ')} />
	<meta property="og:site_name" content={siteConfig.title} />
	<meta property="og:locale" content={siteConfig.lang} />
	{#if !isPostDetail}
		<meta property="og:type" content="website" />
		<meta property="og:url" content={siteConfig.url} />
		<meta property="og:title" content={siteConfig.title} />
		<meta property="og:description" content={siteConfig.description} />
		<meta property="og:image" content="{siteConfig.url}/files/img/official.png" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:title" content={siteConfig.title} />
		<meta name="twitter:description" content={siteConfig.description} />
		<meta name="twitter:image" content="{siteConfig.url}/files/img/official.png" />
	{/if}
	<link rel="canonical" href={siteConfig.url} />

	<!-- RSS Feed -->
	<link rel="alternate" type="application/rss+xml" title="{siteConfig.title} RSS Feed" href="/rss.xml" />
</svelte:head>

<NavBar />

{@render children()}

<BackToTop />

<Analytics />

<CookieConsent />

<ShortLinkRedirect />

<DashLoader />
