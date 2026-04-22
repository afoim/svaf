<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config/site';
	import { tryDecodeShortLink } from '$lib/utils/zwShortLink';
	import BackToTop from '$lib/components/BackToTop.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import CookieConsent from '$lib/components/CookieConsent.svelte';

	let { children } = $props();

	let redirecting = $state(false);
	let redirectTarget = $state('');

	onMount(() => {
		const target = tryDecodeShortLink(window.location.pathname);
		if (target) {
			redirecting = true;
			redirectTarget = target;
			window.location.replace(target);
		}
	});
</script>

<svelte:head>
	<title>{siteConfig.title}</title>
	<link rel="icon" href={siteConfig.icon} />
	<meta name="description" content={siteConfig.description} />
	<meta name="keywords" content={siteConfig.keywords.join(', ')} />
	<meta property="og:url" content={siteConfig.url} />
	<meta property="og:image" content={siteConfig.icon} />
	<meta property="og:site_name" content={siteConfig.title} />
	<meta property="og:description" content={siteConfig.description} />
	<meta property="og:title" content={siteConfig.title} />
	<link rel="canonical" href={siteConfig.url} />
	
	<!-- RSS Feed -->
	<link rel="alternate" type="application/rss+xml" title="{siteConfig.title} RSS Feed" href="/rss.xml" />
</svelte:head>

<NavBar />

{#if redirecting}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
		<p class="text-lg font-medium">正在跳转...</p>
		<p class="text-sm text-muted-foreground break-all max-w-md text-center">
			{redirectTarget}
		</p>
	</div>
{:else}
	{@render children()}
{/if}

<BackToTop />

<Analytics />

<CookieConsent />
