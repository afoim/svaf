<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { siteConfig } from '$lib/config/site';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	
	let totalPageViews = $state<number | null>(null);
	let sponsors = $state<any[]>([]);
	
	async function loadTotalPageViews() {
		try {
			const response = await fetch('https://t.2x.nz/batch', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				body: JSON.stringify(['/'])
			});
			
			if (response.ok) {
				const views = await response.json() as number[];
				totalPageViews = views[0] || 0;
			}
		} catch (error) {
			console.error('Failed to load total page views:', error);
		}
	}
	
	async function loadSponsors() {
		try {
			// 模拟加载赞助列表
			sponsors = [
				{ name: '赞助者1', amount: '¥50' },
				{ name: '赞助者2', amount: '¥100' },
				{ name: '赞助者3', amount: '¥200' }
			];
		} catch (error) {
			console.error('Failed to load sponsors:', error);
		}
	}
	
	onMount(() => {
		loadTotalPageViews();
		loadSponsors();
	});
</script>

<svelte:head>
	<title>{siteConfig.title} - 首页</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-6">
	<img src={siteConfig.bio.avatar} alt="Avatar" class="h-32 w-32 rounded-full" />
	
	<div class="text-center">
		<h1 class="text-4xl font-bold mb-2">{siteConfig.bio.name}</h1>
		<p class="text-lg text-muted-foreground mb-4">{siteConfig.bio.bio}</p>
		{#if totalPageViews !== null}
			<p class="text-sm text-muted-foreground">
				全站浏览量: {totalPageViews.toLocaleString()}
			</p>
		{/if}
	</div>

	<!-- 社交媒体链接 -->
	<div class="flex flex-wrap gap-3 justify-center">
		{#each siteConfig.bio.links as link}
			<a href={link.url} target="_blank" rel="noopener noreferrer">
				<Button variant="outline" class="flex items-center gap-2">
					<Icon 
						icon={link.icon} 
						class="w-5 h-5"
						style={link.name === 'QQ群' ? 'color: #333333' : 
						       link.name === 'Telegram群' ? 'color: #0088cc' : 
						       link.name === 'Bilibili' ? 'color: #fb7299' : 
						       link.name === 'GitHub' ? 'color: #333333' : 
						       link.name === 'Folo' ? 'color: #ff6b35' : ''}
					/>
					<span class="text-sm font-medium">{link.name}</span>
				</Button>
			</a>
		{/each}
	</div>
	
	<div class="mt-4 flex gap-3">
		<a href="/posts">
			<Button class="flex items-center gap-2">
				<Icon icon="mdi:post-outline" class="w-5 h-5" />
				博客
			</Button>
		</a>
		
		<Dialog>
			<DialogTrigger asChild>
				<Button class="flex items-center gap-2">
					<Icon icon="mdi:heart-outline" class="w-5 h-5" />
					赞助
				</Button>
			</DialogTrigger>
			<DialogContent class="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>赞助支持</DialogTitle>
					<DialogDescription>
						感谢您的支持，您的赞助将帮助我继续创作优质内容
					</DialogDescription>
				</DialogHeader>
				<Tabs defaultValue="wechat">
					<TabsList class="grid w-full grid-cols-3">
						<TabsTrigger value="wechat">微信支付</TabsTrigger>
						<TabsTrigger value="alipay">支付宝</TabsTrigger>
						<TabsTrigger value="sponsors">赞助列表</TabsTrigger>
					</TabsList>
					<TabsContent value="wechat" class="mt-4">
						<div class="flex flex-col items-center justify-center p-4">
							<img src="/sponsors/qrcode/wechat.svg" alt="微信支付" class="w-48 h-48 mb-4" />
							<p class="text-center">微信扫码支付</p>
						</div>
					</TabsContent>
					<TabsContent value="alipay" class="mt-4">
						<div class="flex flex-col items-center justify-center p-4">
							<img src="/sponsors/qrcode/alipay.svg" alt="支付宝" class="w-48 h-48 mb-4" />
							<p class="text-center">支付宝扫码支付</p>
						</div>
					</TabsContent>
					<TabsContent value="sponsors" class="mt-4">
						<div class="space-y-2">
							{#each sponsors as sponsor}
								<div class="flex justify-between items-center p-2 border rounded">
									<span>{sponsor.name}</span>
									<span>{sponsor.amount}</span>
								</div>
							{/each}
							{#if sponsors.length === 0}
								<p class="text-center text-muted-foreground">暂无赞助记录</p>
							{/if}
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
		
		<Button
			variant="outline"
			class="flex items-center gap-2"
			onclick={() => {
				if (window.cookieconsent && typeof window.cookieconsent.openPreferencesCenter === 'function') {
					window.cookieconsent.openPreferencesCenter();
				}
			}}
		>
			<Icon icon="mdi:cookie-settings" class="w-5 h-5" />
			Cookie 设置
		</Button>
	</div>
</div>
