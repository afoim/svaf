<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Tabs, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import PageViews from '$lib/components/PageViews.svelte';
	import PhotoSwipeLightbox from 'photoswipe/lightbox';
	import 'photoswipe/style.css';

	const COUNT_JSON_URL = 'https://p.2x.nz/count.json';
	const DOMAIN = 'https://p.2x.nz';
	const FALLBACK = { h: 1074, v: 4003 };

	let counts = $state<{ h: number; v: number }>({ h: 0, v: 0 });
	let currentType = $state<'h' | 'v'>('h');
	let isReverse = $state(false);
	let nextIndex = $state(1);
	let loading = $state(false);
	let urls = $state<string[]>([]);
	let footerStatus = $state('');

	let galleryEl: HTMLDivElement | undefined;
	let sentinelEl: HTMLDivElement | undefined;
	let io: IntersectionObserver | null = null;
	let lightbox: PhotoSwipeLightbox | null = null;

	function resetIndex() {
		const max = counts[currentType] || 0;
		nextIndex = isReverse ? max : 1;
	}

	function getNextIndex(max: number): number | null {
		if (isReverse) {
			if (nextIndex < 1) return null;
			return nextIndex--;
		}
		if (nextIndex > max) return null;
		return nextIndex++;
	}

	function buildImgUrl(n: number) {
		return `${DOMAIN}/ri/${currentType}/${n}.webp`;
	}

	async function fetchCounts() {
		try {
			const res = await fetch(COUNT_JSON_URL, { cache: 'no-store' });
			if (!res.ok) throw new Error(String(res.status));
			const data = await res.json();
			const h = Number(data.h || 0);
			const v = Number(data.v || 0);
			if (!Number.isFinite(h) || !Number.isFinite(v)) throw new Error('counts invalid');
			counts = { h, v };
		} catch {
			counts = { ...FALLBACK };
		}
	}

	function clearGallery() {
		urls = [];
		footerStatus = '';
		resetIndex();
	}

	async function loadMore(batch = 24) {
		if (loading) return;
		const max = counts[currentType];
		if (!max) return;
		loading = true;
		footerStatus = '加载中...';

		const batchUrls: string[] = [];
		for (let i = 0; i < batch; i++) {
			const n = getNextIndex(max);
			if (n === null) break;
			batchUrls.push(buildImgUrl(n));
		}
		if (batchUrls.length > 0) urls = [...urls, ...batchUrls];

		const hasMore = isReverse ? nextIndex >= 1 : nextIndex <= max;
		footerStatus = hasMore ? '' : '已加载全部';

		await tick();
		loading = false;
	}

	function setType(type: 'h' | 'v') {
		if (currentType === type) return;
		currentType = type;
		clearGallery();
		loadMore(24);
	}

	function toggleSort() {
		isReverse = !isReverse;
		clearGallery();
		loadMore(24);
	}

	onMount(async () => {
		await fetchCounts();
		clearGallery();
		await loadMore(24);

		// 无限滚动
		if (sentinelEl) {
			io = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting && !loading)) loadMore(20);
				},
				{ rootMargin: '600px 0px' }
			);
			io.observe(sentinelEl);
		}

		// PhotoSwipe
		lightbox = new PhotoSwipeLightbox({
			gallery: '#gallery-grid',
			children: 'a',
			pswpModule: () => import('photoswipe')
		});
		lightbox.addFilter('itemData', (itemData) => {
			const a = itemData.element as HTMLAnchorElement;
			const img = a?.querySelector('img') as HTMLImageElement | null;
			return {
				src: a.href,
				width: img?.naturalWidth || 1600,
				height: img?.naturalHeight || 1200,
				alt: img?.alt || ''
			};
		});
		lightbox.init();
	});

	onDestroy(() => {
		io?.disconnect();
		lightbox?.destroy();
	});
</script>

<svelte:head>
	<title>画廊 - 二叉树树</title>
	<meta name="description" content="浏览精选图片集" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-12">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:image-multiple" class="size-6 text-primary" />
					画廊
				</CardTitle>
				<div class="flex items-center gap-3 text-sm text-muted-foreground">
					<span>共 {counts[currentType] || 0} 张</span>
					<PageViews pathname="/gallery/" class="text-sm" />
				</div>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground leading-relaxed">
				图片二进制自托管于：
				<a
					href="https://p.2x.nz"
					target="_blank"
					rel="noopener noreferrer"
					class="font-medium text-primary hover:underline"
				>
					https://p.2x.nz
				</a>
				<br />
				特别鸣谢：<b class="font-bold text-foreground">锦瑟/瑞希</b> 大佬提供的图源
			</p>

			<div class="flex flex-wrap items-center gap-3">
				<Tabs value={currentType} onValueChange={(v) => setType(v as 'h' | 'v')}>
					<TabsList>
						<TabsTrigger value="h">
							<Icon icon="mdi:image-area" class="size-4" />
							横屏
						</TabsTrigger>
						<TabsTrigger value="v">
							<Icon icon="mdi:image-area" class="size-4 rotate-90" />
							竖屏
						</TabsTrigger>
					</TabsList>
				</Tabs>
				<Button variant={isReverse ? 'default' : 'outline'} size="sm" onclick={toggleSort}>
					<Icon icon={isReverse ? 'mdi:sort-clock-ascending' : 'mdi:sort-clock-descending'} class="size-4" />
					{isReverse ? '最旧' : '最新'}
				</Button>
			</div>

			<div
				bind:this={galleryEl}
				id="gallery-grid"
				class="columns-2 gap-4 md:columns-3 lg:columns-4"
			>
				{#each urls as url (url)}
					<a
						href={url}
						class="mb-4 block overflow-hidden rounded-xl ring-1 ring-foreground/10 break-inside-avoid transition active:scale-[0.99]"
					>
						<img
							src={url}
							alt="gallery"
							loading="lazy"
							decoding="async"
							style="aspect-ratio: {currentType === 'h' ? '4 / 3' : '3 / 4'};"
							onload={(e) => {
								const img = e.currentTarget as HTMLImageElement;
								if (img.naturalWidth && img.naturalHeight) {
									img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
								}
							}}
							class="block h-auto w-full bg-muted"
						/>
					</a>
				{/each}
			</div>

			<div class="mt-2 h-10 text-center text-sm text-muted-foreground">{footerStatus}</div>
			<div bind:this={sentinelEl} class="h-4"></div>
		</CardContent>
	</Card>
</div>
