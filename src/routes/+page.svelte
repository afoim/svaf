<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
</script>

<svelte:head>
	<title>{siteConfig.name} - 首页</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-4">
	<img src={siteConfig.icon} alt="Site Icon" class="h-24 w-24 rounded-full" />
	
	<h1 class="text-4xl font-bold">欢迎来到 {siteConfig.name}</h1>
	<p class="text-muted-foreground">
		{siteConfig.description}
	</p>
	<p class="text-sm text-muted-foreground">
		站点地址: <a href={siteConfig.url} class="underline hover:text-foreground">{siteConfig.url}</a>
	</p>
	
	<div class="flex gap-2">
		<Button>Default Button</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="destructive">Destructive</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="ghost">Ghost</Button>
	</div>
</div>
