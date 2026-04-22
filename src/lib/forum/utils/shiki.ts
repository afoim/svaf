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
				themes: ['github-light', 'github-dark'],
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
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false
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
	// 给 <pre> 加 data-language（rehype-pretty-code 风格）
	if (!/<pre[^>]*data-language=/.test(out)) {
		out = out.replace(/<pre\b/, `<pre data-language="${lang}"`);
	}
	// 给 <code> 加 data-language（如果 shiki 没加）
	if (!/<code[^>]*data-language=/.test(out)) {
		out = out.replace(/<code\b/, `<code data-language="${lang}"`);
	}
	return out;
}
