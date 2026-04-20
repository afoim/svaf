<script lang="ts">
	import '../app.css';
	import { siteConfig } from '$lib/config/site';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={siteConfig.icon} />
	<meta property="og:url" content={siteConfig.url} />
	<meta property="og:image" content={siteConfig.icon} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:description" content={siteConfig.description} />
	<meta name="description" content={siteConfig.description} />
	<link rel="canonical" href={siteConfig.url} />
</svelte:head>

{@render children()}
