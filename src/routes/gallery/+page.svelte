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
	const DEFAULT_RATIO_H = 4 / 3; // width / height
	const DEFAULT_RATIO_V = 3 / 4;

	let counts = $state<{ h: number; v: number }>({ h: 0, v: 0 });
	let currentType = $state<'h' | 'v'>('h');
	let isReverse = $state(false);
	let nextIndex = $state(1);
	let loading = $state(false);
	let footerStatus = $state('');
	let columnCount = $state(2);

	// 每列独立的 url 数组
	let columns = $state<string[][]>([[], []]);
	// 每列累计高度（基于占位 aspect-ratio 估算）
	let columnHeights: number[] = [0, 0];

	let galleryEl: HTMLDivElement | undefined;
	let sentinelEl: HTMLDivElement | undefined;
	let io: IntersectionObserver | null = null;
	let lightbox: PhotoSwipeLightbox | null = null;
	let resizeRO: ResizeObserver | null = null;

	function getColumnCount(): number {
		if (typeof window === 'undefined') return 2;
		const w = window.innerWidth;
		if (w >= 1024) return 4;
		if (w >= 768) return 3;
		return 2;
	}

	function defaultRatio() {
		return currentType === 'h' ? DEFAULT_RATIO_H : DEFAULT_RATIO_V;
	}

	function pushToShortest(url: string) {
		// 选最短列
		let minIdx = 0;
		for (let i = 1; i < columnHeights.length; i++) {
			if (columnHeights[i] < columnHeights[minIdx]) minIdx = i;
		}
		columns[minIdx] = [...columns[minIdx], url];
		// 估算高度（占位高度 = 1 / ratio）
		columnHeights[minIdx] += 1 / defaultRatio();
	}

	function rebuildColumns(urls: string[]) {
		columns = Array.from({ length: columnCount }, () => []);
		columnHeights = new Array(columnCount).fill(0);
		for (const u of urls) pushToShortest(u);
		// 触发响应式
		columns = [...columns];
	}

	function allUrls(): string[] {
		// 按"列内顺序"展开，用于重布局
		const result: string[] = [];
		const idx = new Array(columns.length).fill(0);
		while (true) {
			let added = false;
			for (let c = 0; c < columns.length; c++) {
				if (idx[c] < columns[c].length) {
					result.push(columns[c][idx[c]++]);
					added = true;
				}
			}
			if (!added) break;
		}
		return result;
	}

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
		columnCount = getColumnCount();
		columns = Array.from({ length: columnCount }, () => []);
		columnHeights = new Array(columnCount).fill(0);
		footerStatus = '';
		resetIndex();
	}

	async function loadMore(batch = 24) {
		if (loading) return;
		const max = counts[currentType];
		if (!max) return;
		loading = true;
		footerStatus = '加载中...';

		for (let i = 0; i < batch; i++) {
			const n = getNextIndex(max);
			if (n === null) break;
			pushToShortest(buildImgUrl(n));
		}
		columns = [...columns];

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

	function handleImgLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		if (img.naturalWidth && img.naturalHeight) {
			img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
		}
	}

	function handleResize() {
		const newCount = getColumnCount();
		if (newCount === columnCount) return;
		columnCount = newCount;
		const flat = allUrls();
		rebuildColumns(flat);
	}

	onMount(async () => {
		columnCount = getColumnCount();
		await fetchCounts();
		clearGallery();
		await loadMore(24);

		if (sentinelEl) {
			io = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting && !loading)) loadMore(20);
				},
				{ rootMargin: '600px 0px' }
			);
			io.observe(sentinelEl);
		}

		window.addEventListener('resize', handleResize, { passive: true });

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
		resizeRO?.disconnect();
		lightbox?.destroy();
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', handleResize);
		}
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
					<Icon
						icon={isReverse ? 'mdi:sort-clock-ascending' : 'mdi:sort-clock-descending'}
						class="size-4"
					/>
					{isReverse ? '最旧' : '最新'}
				</Button>
			</div>

			<div bind:this={galleryEl} id="gallery-grid" class="flex gap-4 items-start">
				{#each columns as col, ci (ci)}
					<div class="flex flex-1 flex-col gap-4 min-w-0">
						{#each col as url (url)}
							<a
								href={url}
								class="block overflow-hidden rounded-xl ring-1 ring-foreground/10 transition active:scale-[0.99]"
							>
								<img
									src={url}
									alt="gallery"
									loading="lazy"
									decoding="async"
									style="aspect-ratio: {defaultRatio()};"
									onload={handleImgLoad}
									class="block h-auto w-full bg-muted"
								/>
							</a>
						{/each}
					</div>
				{/each}
			</div>

			<div class="mt-2 h-10 text-center text-sm text-muted-foreground">{footerStatus}</div>
			<div bind:this={sentinelEl} class="h-4"></div>
		</CardContent>
	</Card>
</div>
