// 通过 jsdelivr CDN 加载 mermaid，按需挂到 window.mermaid

const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@11.14.0/dist/mermaid.min.js';

interface MermaidLike {
	initialize(opts: Record<string, unknown>): void;
	render(id: string, text: string): Promise<{ svg: string }>;
}
declare global {
	interface Window {
		mermaid?: MermaidLike;
	}
}

let mermaidPromise: Promise<MermaidLike> | null = null;
let initialized = false;

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[data-mermaid-src="${src}"]`)) {
			resolve();
			return;
		}
		const s = document.createElement('script');
		s.src = src;
		s.async = true;
		s.setAttribute('data-mermaid-src', src);
		s.onload = () => {
			console.log('[mermaid] script loaded:', src);
			resolve();
		};
		s.onerror = (e) => {
			console.error('[mermaid] script failed:', src, e);
			reject(e);
		};
		document.head.appendChild(s);
	});
}

async function getMermaid(): Promise<MermaidLike> {
	if (window.mermaid) return window.mermaid;
	if (!mermaidPromise) {
		console.log('[mermaid] loading core...');
		mermaidPromise = loadScript(MERMAID_CDN).then(() => {
			if (!window.mermaid) throw new Error('window.mermaid not present after script load');
			return window.mermaid;
		});
	}
	return mermaidPromise;
}

function decodeText(pre: HTMLElement): string {
	// 兼容 rehype-pretty-code 残留 DOM（每行 <span data-line>）
	const lines = pre.querySelectorAll('span[data-line]');
	if (lines.length === 0) return (pre.textContent ?? '').trim();
	return Array.from(lines)
		.map((l) => (l.textContent ?? '').replace(/\u00a0/g, ' '))
		.join('\n')
		.trim();
}

/**
 * 扫描容器内 mermaid 代码块并渲染为 SVG，原地替换 <pre>。
 * 同时识别：
 * - <pre data-language="mermaid">  (rehype-pretty-code)
 * - <pre><code class="language-mermaid">  (mdsvex / markdown-it 默认)
 */
export async function renderMermaidIn(container: HTMLElement | null | undefined) {
	if (!container) return;

	const candidates = new Set<HTMLElement>();
	for (const el of Array.from(
		container.querySelectorAll<HTMLElement>('pre[data-language="mermaid"]')
	))
		candidates.add(el);
	for (const code of Array.from(
		container.querySelectorAll<HTMLElement>('code.language-mermaid, code[class*="language-mermaid"]')
	)) {
		const pre = code.closest('pre') as HTMLElement | null;
		if (pre) candidates.add(pre);
	}
	if (candidates.size === 0) return;
	console.log(`[mermaid] found ${candidates.size} blocks in container`);

	const mermaid = await getMermaid();
	if (!initialized) {
		const isDark = document.documentElement.classList.contains('dark');
		mermaid.initialize({
			startOnLoad: false,
			theme: isDark ? 'dark' : 'default',
			securityLevel: 'loose',
			fontFamily: 'inherit'
		});
		initialized = true;
	}

	let i = 0;
	for (const pre of candidates) {
		const code = decodeText(pre);
		if (!code) continue;
		const id = `mermaid-${Date.now()}-${i++}`;
		try {
			const { svg } = await mermaid.render(id, code);
			const wrapper = document.createElement('div');
			wrapper.className = 'mermaid-rendered flex justify-center my-4 not-prose';
			wrapper.innerHTML = svg;
			pre.replaceWith(wrapper);
			console.log(`[mermaid] block ${i}: rendered`);
		} catch (err) {
			console.error('[mermaid] render failed:', err);
			const errEl = document.createElement('pre');
			errEl.className = 'text-destructive text-xs';
			errEl.textContent = `Mermaid 渲染失败: ${(err as Error).message}\n\n${code}`;
			pre.replaceWith(errEl);
		}
	}
}
