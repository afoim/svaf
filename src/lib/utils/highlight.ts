// highlight.js 按需加载封装
// - 语言模块按需动态 import，避免一次打包全部语言
// - 主题 CSS 通过 CDN <link> 注入到 head（不碰本地 CSS）

import type { HLJSApi } from 'highlight.js';

let hljsPromise: Promise<HLJSApi> | null = null;
let autoLangsLoaded = false;
const loadedLangs = new Set<string>();
let themeInjected = false;

const THEME_CDN = 'https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github.min.css';

// hljs 别名 → 真实模块名
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

// 自动检测时尝试的常用语言
const AUTO_DETECT_LANGS = [
	'javascript',
	'typescript',
	'json',
	'bash',
	'xml',
	'css',
	'python',
	'go',
	'rust',
	'yaml',
	'markdown',
	'sql',
	'cpp',
	'csharp',
	'java',
	'php',
	'ruby',
	'kotlin',
	'swift',
	'dockerfile',
	'ini'
];

function ensureThemeLink() {
	if (themeInjected || typeof document === 'undefined') return;
	if (document.querySelector(`link[data-hljs-theme]`)) {
		themeInjected = true;
		console.log('[hljs] theme link already present');
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = THEME_CDN;
	link.setAttribute('data-hljs-theme', 'github');
	link.onload = () => console.log('[hljs] theme CSS loaded:', THEME_CDN);
	link.onerror = (e) => console.error('[hljs] theme CSS load failed:', THEME_CDN, e);
	document.head.appendChild(link);
	themeInjected = true;
	console.log('[hljs] theme link appended:', THEME_CDN);
}

async function getHljs(): Promise<HLJSApi> {
	if (!hljsPromise) {
		console.log('[hljs] loading core module...');
		hljsPromise = import('highlight.js/lib/core').then((m) => {
			console.log('[hljs] core module loaded');
			return m.default;
		});
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
		console.log(`[hljs] lang loaded: ${name}`);
		return name;
	} catch (err) {
		console.warn(`[hljs] failed to load lang: ${name}`, err);
		return null;
	}
}

async function preloadAutoDetectLangs(hljs: HLJSApi) {
	if (autoLangsLoaded) return;
	autoLangsLoaded = true;
	console.log('[hljs] preloading auto-detect langs...');
	await Promise.all(AUTO_DETECT_LANGS.map((l) => ensureLang(hljs, l)));
	console.log(`[hljs] auto-detect langs ready (${loadedLangs.size} loaded)`);
}

/**
 * 扫描容器中所有 <pre><code> 代码块并应用 highlight.js 高亮。
 * - 若 <code class="language-xx"> 指定了语言，按指定语言高亮
 * - 否则用 highlightAuto 自动检测（限定在 AUTO_DETECT_LANGS 范围内）
 * 高亮后给 <code> 加 hljs class，由 CDN 主题 CSS 自动接管样式（含整体背景）。
 */
export async function highlightCodeBlocksIn(container: HTMLElement | null | undefined) {
	console.log('[hljs] highlightCodeBlocksIn called, container:', container);
	if (!container) {
		console.warn('[hljs] no container provided');
		return;
	}

	const allPres = container.querySelectorAll('pre');
	console.log(`[hljs] container has ${allPres.length} <pre> elements`);

	const blocks = container.querySelectorAll<HTMLElement>('pre > code');
	console.log(`[hljs] selector "pre > code" matched ${blocks.length} blocks`);

	if (blocks.length === 0) {
		const looseBlocks = container.querySelectorAll('pre code');
		console.log(
			`[hljs] fallback selector "pre code" matched ${looseBlocks.length} blocks`,
			Array.from(looseBlocks).slice(0, 3)
		);
		return;
	}

	ensureThemeLink();
	const hljs = await getHljs();
	await preloadAutoDetectLangs(hljs);

	let i = 0;
	for (const code of Array.from(blocks)) {
		i++;
		if (code.dataset.hljsRendered === '1') {
			console.log(`[hljs] block ${i} already rendered, skip`);
			continue;
		}
		const cls = code.className || '';
		const m = cls.match(/language-([\w+#-]+)/i);
		const requested = m && m[1] ? m[1].toLowerCase() : '';
		const text = code.textContent || '';

		try {
			if (requested) {
				const lang = await ensureLang(hljs, requested);
				if (lang) {
					const result = hljs.highlight(text, { language: lang });
					code.innerHTML = result.value;
					code.classList.add('hljs', `language-${lang}`);
					console.log(`[hljs] block ${i}: highlighted as ${lang}`);
				} else {
					code.classList.add('hljs');
					console.log(`[hljs] block ${i}: lang "${requested}" unavailable, fallback`);
				}
			} else {
				const result = hljs.highlightAuto(text, AUTO_DETECT_LANGS);
				code.innerHTML = result.value;
				code.classList.add('hljs');
				if (result.language) code.classList.add(`language-${result.language}`);
				console.log(
					`[hljs] block ${i}: auto-detected as ${result.language || 'unknown'} (relevance ${result.relevance})`
				);
			}
			code.dataset.hljsRendered = '1';
		} catch (err) {
			console.error(`[hljs] block ${i}: highlight failed`, err);
		}
	}
	console.log(`[hljs] done, processed ${i} blocks`);
}
