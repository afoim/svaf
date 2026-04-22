<script lang="ts">
	import { onMount, tick } from 'svelte';

	let { selector = '.prose' }: { selector?: string } = $props();

	let container: HTMLElement | undefined;

	function decodeText(pre: HTMLElement): string {
		// rehype-pretty-code 把每行包成 <span data-line>...</span>，
		// 直接取 textContent 即可拿到原始 mermaid 源码（含换行）。
		// 对每行用 \n 拼接更稳：遍历 data-line。
		const lines = pre.querySelectorAll('span[data-line]');
		if (lines.length === 0) {
			return (pre.textContent ?? '').trim();
		}
		return Array.from(lines)
			.map((l) => (l.textContent ?? '').replace(/\u00a0/g, ' '))
			.join('\n')
			.trim();
	}

	async function render() {
		if (!container) return;

		const blocks = container.querySelectorAll<HTMLElement>(
			'pre[data-language="mermaid"]'
		);
		if (blocks.length === 0) return;

		const mermaid = (await import('mermaid')).default;
		const isDark = document.documentElement.classList.contains('dark');
		mermaid.initialize({
			startOnLoad: false,
			theme: isDark ? 'dark' : 'default',
			securityLevel: 'loose',
			fontFamily: 'inherit'
		});

		let i = 0;
		for (const pre of Array.from(blocks)) {
			const code = decodeText(pre);
			if (!code) continue;
			const id = `mermaid-${Date.now()}-${i++}`;
			try {
				const { svg } = await mermaid.render(id, code);
				const wrapper = document.createElement('div');
				wrapper.className = 'mermaid-rendered flex justify-center my-4 not-prose';
				wrapper.innerHTML = svg;
				pre.replaceWith(wrapper);
			} catch (err) {
				console.error('[mermaid] render failed:', err);
				const errEl = document.createElement('pre');
				errEl.className = 'text-destructive text-xs';
				errEl.textContent = `Mermaid 渲染失败: ${(err as Error).message}\n\n${code}`;
				pre.replaceWith(errEl);
			}
		}
	}

	onMount(async () => {
		container = document.querySelector(selector) as HTMLElement;
		await tick();
		render();
	});
</script>
