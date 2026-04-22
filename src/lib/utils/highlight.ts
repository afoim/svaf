// highlight.js 按需加载封装
// - 语言模块按需动态 import，避免一次打包全部语言
// - 主题 CSS 通过 CDN <link> 注入到 head（用户要求不碰本地 CSS）

import type { HLJSApi } from 'highlight.js';

let hljsPromise: Promise<HLJSApi> | null = null;
const loadedLangs = new Set<string>();
let themeInjected = false;

const THEME_CDN =
	'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css';

// hljs 内部别名 → 实际 import 路径
const LANG_ALIASES: Record<string, string> = {
	js: 'javascript',
	ts: 'typescript',
	sh: 'bash',
	shell: 'bash',
	zsh: 'bash',
	yml: 'yaml',
	md: 'markdown',
	html: 'xml',
	htm: 'xml',
	svg: 'xml',
	'c++': 'cpp',
	'c#': 'csharp'
};

function ensureThemeLink() {
	if (themeInjected || typeof document === 'undefined') return;
	if (document.querySelector(`link[data-hljs-theme]`)) {
		themeInjected = true;
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = THEME_CDN;
	link.setAttribute('data-hljs-theme', 'github');
	document.head.appendChild(link);
	themeInjected = true;
}

async function getHljs(): Promise<HLJSApi> {
	if (!hljsPromise) {
		hljsPromise = import('highlight.js/lib/core').then((m) => m.default);
	}
	return hljsPromise;
}

async function ensureLang(hljs: HLJSApi, raw: string): Promise<string | null> {
	const name = LANG_ALIASES[raw] || raw;
	if (loadedLangs.has(name)) return name;
	if (hljs.getLanguage(name)) {
		loadedLangs.add(name);
		return name;
	}
	try {
		const mod = await import(`highlight.js/lib/languages/${name}`);
		hljs.registerLanguage(name, mod.default);
		loadedLangs.add(name);
		return name;
	} catch {
		return null;
	}
}

/**
 * 扫描容器中所有 <pre><code class="language-xx"> 代码块并应用 highlight.js 高亮。
 * 高亮后给 <code> 加 hljs class，由 CDN 主题 CSS 自动接管样式（包含整体背景）。
 */
export async function highlightCodeBlocksIn(container: HTMLElement | null | undefined) {
	if (!container) return;
	const blocks = container.querySelectorAll<HTMLElement>('pre > code');
	if (blocks.length === 0) return;

	ensureThemeLink();
	const hljs = await getHljs();

	for (const code of Array.from(blocks)) {
		if (code.dataset.hljsRendered === '1') continue;
		const cls = code.className || '';
		const m = cls.match(/language-([\w+#-]+)/i);
		const requested = (m && m[1].toLowerCase()) || 'plaintext';
		const lang = await ensureLang(hljs, requested);
		try {
			if (lang) {
				const result = hljs.highlight(code.textContent || '', { language: lang });
				code.innerHTML = result.value;
				code.classList.add('hljs', `language-${lang}`);
			} else {
				// 未知语言：仅加 hljs class 让主题 CSS 给个统一背景
				code.classList.add('hljs');
			}
			code.dataset.hljsRendered = '1';
		} catch {
			// 忽略单个代码块失败
		}
	}
}
