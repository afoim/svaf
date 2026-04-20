<script lang="ts">
	import '../app.css';
	import { siteConfig } from '$lib/config/site';

	let { children } = $props();
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
</svelte:head>

{@render children()}
