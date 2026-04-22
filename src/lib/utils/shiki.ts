import type { Highlighter, BundledLanguage } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;
const loadedLangs = new Set<string>(['plaintext', 'text']);

const PRELOAD_LANGS: BundledLanguage[] = [
	'javascript',
	'typescript',
	'json',
	'bash',
	'shell',
	'html',
	'css',
	'markdown',
	'python',
	'go',
	'rust'
];

async function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = import('shiki').then(({ createHighlighter }) =>
			createHighlighter({
				themes: ['github-light'],
				langs: PRELOAD_LANGS
			}).then((h) => {
				for (const l of PRELOAD_LANGS) loadedLangs.add(l);
				return h;
			})
		);
	}
	return highlighterPromise;
}

async function ensureLang(h: Highlighter, lang: string) {
	if (loadedLangs.has(lang)) return;
	try {
		await h.loadLanguage(lang as BundledLanguage);
		loadedLangs.add(lang);
	} catch {
		// 不支持的语言降级为纯文本
	}
}

/**
 * 把代码字符串高亮为与 rehype-pretty-code 同款的双主题 HTML。
 * 输出形如：
 *   <pre style="--shiki-light:#xxx;--shiki-dark:#xxx;--shiki-light-bg:#xxx;--shiki-dark-bg:#xxx"
 *        tabindex="0" data-language="ts">
 *     <code data-language="ts">...</code>
 *   </pre>
 */
export async function highlightCodeForForum(code: string, lang?: string): Promise<string> {
	try {
		const h = await getHighlighter();
		const useLang = lang && lang.trim() ? lang.toLowerCase() : 'plaintext';
		await ensureLang(h, useLang);
		const finalLang = loadedLangs.has(useLang) ? (useLang as BundledLanguage) : 'plaintext';
		const html = h.codeToHtml(code, {
			lang: finalLang,
			theme: 'github-light'
		});
		return postProcessShikiHtml(html, finalLang);
	} catch {
		const escaped = code
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		return `<pre><code>${escaped}</code></pre>`;
	}
}

/**
 * shiki `defaultColor:false` 输出的 <pre> style 形如：
 *   "--shiki-light:#24292e;--shiki-light-bg:#ffffff;--shiki-dark:#e1e4e8;--shiki-dark-bg:#24292e"
 * 这与 rehype-pretty-code 输出已完全一致，但 shiki 多了 tabindex/data-language。
 * 这里只补齐 data-language 与 data-theme 属性，统一给所有 <span> 加 data-line 之类增强（可选）。
 */
function postProcessShikiHtml(html: string, lang: string): string {
	let out = html;
	if (!/<pre[^>]*data-language=/.test(out)) {
		out = out.replace(/<pre\b/, `<pre data-language="${lang}"`);
	}
	if (!/<code[^>]*data-language=/.test(out)) {
		out = out.replace(/<code\b/, `<code data-language="${lang}"`);
	}
	// 整体背景 + 横向滚动
	out = out.replace(
		/<pre\b([^>]*?)style="([^"]*)"/,
		(_m, attrs, style) =>
			`<pre${attrs}style="${style};display:block;overflow-x:auto;padding:1rem;border-radius:0.5rem;"`
	);
	// 让 <code> 撑满 <pre>，避免长行只有内容宽部分有背景的视觉
	out = out.replace(/<code\b([^>]*)>/, `<code$1 style="display:block;min-width:100%;width:max-content;">`);
	return out;
}
	if (!/<code[^>]*data-language=/.test(out)) {
		out = out.replace(/<code\b/, `<code data-language="${lang}"`);
	}
	// 让 <pre> 的背景覆盖整个滚动区域，而不是只在每行底色
	out = out.replace(
		/<pre\b([^>]*?)style="([^"]*)"/,
		(_m, attrs, style) =>
			`<pre${attrs}style="${style};display:block;overflow-x:auto;padding:1rem;border-radius:0.5rem;"`
	);
	return out;
}

/**
 * 扫描容器中所有 <pre><code class="language-xx"> 代码块，用 shiki 替换为双主题高亮版本。
 * 用于：博客（mdsvex 输出原生 code 块）、论坛（已渲染的 markdown HTML）。
 */
export async function highlightCodeBlocksIn(container: HTMLElement | null | undefined) {
	if (!container) return;
	const blocks = container.querySelectorAll<HTMLElement>('pre > code');
	if (blocks.length === 0) return;

	const tasks: Promise<void>[] = [];
	for (const code of Array.from(blocks)) {
		const pre = code.parentElement as HTMLPreElement | null;
		if (!pre) continue;
		// 已经被 shiki 处理过
		if (pre.hasAttribute('data-shiki-rendered')) continue;

		// 提取语言：优先 className "language-xx"，其次 data-language
		const cls = code.className || '';
		const m = cls.match(/language-([\w-]+)/i);
		const lang =
			(m && m[1]) ||
			code.getAttribute('data-language') ||
			pre.getAttribute('data-language') ||
			'plaintext';

		const text = code.textContent || '';
		tasks.push(
			highlightCodeForForum(text, lang).then((html) => {
				const tpl = document.createElement('template');
				tpl.innerHTML = html.trim();
				const newPre = tpl.content.firstElementChild as HTMLElement | null;
				if (newPre) {
					newPre.setAttribute('data-shiki-rendered', '');
					pre.replaceWith(newPre);
				}
			})
		);
	}
	await Promise.all(tasks);
}
