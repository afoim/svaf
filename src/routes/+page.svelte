<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { siteConfig } from '$lib/config/site';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import { spaCache } from '$lib/utils/spaCache';
	
	let totalPageViews = $state<number | null>(null);
	let isLive = $state<boolean>(false);
	
	async function loadTotalPageViews() {
		totalPageViews = await spaCache.get('homepage-pageviews', async () => {
			const response = await fetch('https://t.2x.nz/batch', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				body: JSON.stringify(['/'])
			});
			
			if (response.ok) {
				const views = await response.json() as number[];
				return views[0] || 0;
			}
			return 0;
		});
	}
	
	async function checkLiveStatus() {
		isLive = await spaCache.get('live-status', async () => {
			const response = await fetch('https://b-live.2x.nz');
			if (response.ok) {
				const status = await response.text();
				return status.trim() === '1';
			}
			return false;
		}, 30000); // 30秒过期
	}
	
	onMount(() => {
		loadTotalPageViews();
		checkLiveStatus();
		
		// 每 30 秒更新一次直播状态
		const interval = setInterval(checkLiveStatus, 30000);
		return () => clearInterval(interval);
	});
</script>

<svelte:head>
	<title>{siteConfig.title} - 首页</title>
	<style>
		@keyframes live-pulse {
			0%, 100% {
				opacity: 1;
				transform: scale(1);
			}
			50% {
				opacity: 0.8;
				transform: scale(1.05);
			}
		}
		
		@keyframes live-ring {
			0% {
				transform: scale(1);
				opacity: 1;
			}
			100% {
				transform: scale(1.5);
				opacity: 0;
			}
		}
		
		.live-avatar-container {
			position: relative;
			display: inline-block;
		}
		
		.live-ring {
			position: absolute;
			top: -4px;
			left: -4px;
			right: -4px;
			bottom: -4px;
			border: 3px solid #ff2d55;
			border-radius: 50%;
			animation: live-ring 1.5s ease-out infinite;
		}
		
		.live-ring:nth-child(2) {
			animation-delay: 0.5s;
		}
		
		.live-ring:nth-child(3) {
			animation-delay: 1s;
		}
		
		.live-badge {
			position: absolute;
			bottom: 0;
			right: 0;
			background: linear-gradient(135deg, #ff2d55 0%, #ff6b9d 100%);
			color: white;
			padding: 4px 12px;
			border-radius: 12px;
			font-size: 12px;
			font-weight: bold;
			display: flex;
			align-items: center;
			gap: 4px;
			box-shadow: 0 2px 8px rgba(255, 45, 85, 0.4);
			animation: live-pulse 2s ease-in-out infinite;
		}
		
		.live-dot {
			width: 6px;
			height: 6px;
			background: white;
			border-radius: 50%;
			animation: live-pulse 1s ease-in-out infinite;
		}
	</style>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center gap-6">
	<div class="live-avatar-container">
		{#if isLive}
			<div class="live-ring"></div>
			<div class="live-ring"></div>
			<div class="live-ring"></div>
		{/if}
		<img src={siteConfig.bio.avatar} alt="Avatar" class="h-32 w-32 rounded-full" />
		{#if isLive}
			<div class="live-badge">
				<div class="live-dot"></div>
				<span>直播中</span>
			</div>
		{/if}
	</div>
	
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
		
		<a href="/timetable">
			<Button variant="outline" class="flex items-center gap-2">
				<Icon icon="mdi:calendar-month" class="w-5 h-5" />
				课程表
			</Button>
		</a>
		
		<a href="/friends">
			<Button variant="outline" class="flex items-center gap-2">
				<Icon icon="mdi:link-variant" class="w-5 h-5" />
				友链
			</Button>
		</a>
		
		<a href="/sponsors">
			<Button variant="outline" class="flex items-center gap-2">
				<Icon icon="mdi:heart" class="w-5 h-5" />
				赞助
			</Button>
		</a>
		
		<a href="https://u.2x.nz/share/CdkXbGgZr6ECKOyK" target="_blank" rel="noopener noreferrer">
			<Button variant="outline" class="flex items-center gap-2">
				<Icon icon="mdi:chart-line" class="w-5 h-5" />
				统计
			</Button>
		</a>
		
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
