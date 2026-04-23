<script lang="ts">
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	let {
		container,
		trigger
	}: {
		/** 文章正文容器（需在挂载后绑定） */
		container?: HTMLElement;
		/** 任意值变化时（如 slug / 文章组件）重建目录 */
		trigger?: unknown;
	} = $props();

	type Heading = { id: string; text: string; level: number };

	let headings = $state<Heading[]>([]);
	let activeId = $state<string>('');
	let mobileOpen = $state(false);
	let observer: IntersectionObserver | undefined;

	// 把实际标题层级压缩到从 1 起算的视觉缩进，避免文章只用 h2/h3 时第一项就被缩进
	let minLevel = $derived(headings.length ? Math.min(...headings.map((h) => h.level)) : 1);
	function indentClass(level: number): string {
		const depth = Math.max(0, level - minLevel);
		return ['pl-3', 'pl-6', 'pl-9', 'pl-12', 'pl-14', 'pl-16'][depth] ?? 'pl-16';
	}

	function slugify(text: string): string {
		return (
			text
				.trim()
				.toLowerCase()
				.replace(/[\s　]+/g, '-')
				// 保留中英文数字与连字符
				.replace(/[^\p{L}\p{N}\-]/gu, '')
				.replace(/-+/g, '-')
				.replace(/^-|-$/g, '') || 'section'
		);
	}

	async function rebuild() {
		await tick();
		if (!container) return;

		observer?.disconnect();
		const els = Array.from(
			container.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6')
		);

		const seen = new Map<string, number>();
		const list: Heading[] = [];
		for (const el of els) {
			const text = (el.textContent || '').trim();
			if (!text) continue;
			let id = el.id || slugify(text);
			if (seen.has(id)) {
				const n = (seen.get(id) || 1) + 1;
				seen.set(id, n);
				id = `${id}-${n}`;
			} else {
				seen.set(id, 1);
			}
			el.id = id;
			list.push({ id, text, level: Number(el.tagName.slice(1)) });
		}
		headings = list;

		if (list.length === 0) return;

		observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) {
					activeId = (visible[0].target as HTMLElement).id;
				}
			},
			// 顶部 80px 偏移、底部留 60% 视窗，避免一次高亮多个
			{ rootMargin: '-80px 0px -60% 0px', threshold: 0 }
		);
		for (const el of els) observer.observe(el);

		// 初始化 activeId 为视窗内最靠上的标题
		const firstVisible = els.find((el) => {
			const r = el.getBoundingClientRect();
			return r.bottom > 80;
		});
		activeId = (firstVisible || els[0]).id;
	}

	$effect(() => {
		void trigger;
		void container;
		rebuild();
		return () => observer?.disconnect();
	});

	function handleClick(e: MouseEvent, id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		e.preventDefault();
		const top = el.getBoundingClientRect().top + window.scrollY - 72;
		window.scrollTo({ top, behavior: 'smooth' });
		history.replaceState(null, '', `#${id}`);
		mobileOpen = false;
	}
</script>

{#if headings.length > 0}
	<!-- 桌面：固定在右侧 -->
	<aside
		class="hidden xl:block fixed top-24 right-[max(1rem,calc((100vw-48rem)/2-18rem))] w-56 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 text-sm z-30"
		aria-label="目录"
	>
		<div class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
			目录
		</div>
		<ul class="space-y-1 border-l border-border">
			{#each headings as h (h.id)}
				<li>
					<a
						href={`#${h.id}`}
						onclick={(e) => handleClick(e, h.id)}
						class="block py-1 pr-2 border-l-2 -ml-px transition-colors {indentClass(
							h.level
						)} {activeId === h.id
							? 'border-primary text-foreground font-medium'
							: 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'}"
					>
						{h.text}
					</a>
				</li>
			{/each}
		</ul>
	</aside>

	<!-- 移动端：右下浮动按钮 + 抽屉 -->
	<div class="xl:hidden">
		<button
			type="button"
			onclick={() => (mobileOpen = !mobileOpen)}
			aria-label="目录"
			aria-expanded={mobileOpen}
			class="fixed bottom-24 right-6 z-40 size-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-colors"
		>
			<Icon icon={mobileOpen ? 'mdi:close' : 'mdi:format-list-bulleted'} class="size-5" />
		</button>

		{#if mobileOpen}
			<button
				type="button"
				aria-label="关闭目录"
				class="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
				onclick={() => (mobileOpen = false)}
			></button>
			<div
				transition:fly={{ y: 20, duration: 200 }}
				class="fixed bottom-40 right-6 z-50 w-72 max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-card shadow-xl p-4"
			>
				<div class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					目录
				</div>
				<ul class="space-y-1 border-l border-border text-sm">
					{#each headings as h (h.id)}
						<li>
							<a
								href={`#${h.id}`}
								onclick={(e) => handleClick(e, h.id)}
								class="block py-1 pr-2 border-l-2 -ml-px transition-colors {indentClass(
									h.level
								)} {activeId === h.id
									? 'border-primary text-foreground font-medium'
									: 'border-transparent text-muted-foreground hover:text-foreground'}"
							>
								{h.text}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
{/if}
