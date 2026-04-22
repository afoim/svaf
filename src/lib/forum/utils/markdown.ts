import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { highlightCodeForForum } from './shiki';

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const SANITIZE_OPTS: DOMPurify.Config = {
	ADD_ATTR: ['target', 'rel', 'loading', 'referrerpolicy', 'style', 'tabindex'],
	ADD_TAGS: ['span'],
	ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
};

/** 在浏览器中给所有外链加 target="_blank" rel="noopener" */
function applyExternalLinkTarget(html: string): string {
	if (typeof document === 'undefined') return html;
	const tpl = document.createElement('template');
	tpl.innerHTML = html;
	for (const a of tpl.content.querySelectorAll('a')) {
		const href = a.getAttribute('href')?.trim();
		if (!href || !/^https?:\/\//i.test(href)) continue;
		a.setAttribute('target', '_blank');
		a.setAttribute('rel', 'noopener noreferrer');
	}
	return tpl.innerHTML;
}

/** 同步渲染：代码块用纯 escape，无高亮（用于 SSR / 首屏占位）。 */
export function renderForumMarkdown(text?: string): string {
	if (!text) return '';
	const raw = md.render(text);
	const safe = DOMPurify.sanitize(raw, SANITIZE_OPTS) as unknown as string;
	return applyExternalLinkTarget(safe);
}

/**
 * 异步渲染：扫描所有 ```lang 代码块用 shiki 高亮，输出双主题 HTML。
 * 与 rehype-pretty-code 完全同款，复用 .prose pre 全局样式。
 */
export async function renderForumMarkdownAsync(text?: string): Promise<string> {
	if (!text) return '';
	const tokens = md.parse(text, {});
	// 收集所有 fence 代码块对应位置，先做占位再异步替换
	const placeholders: { marker: string; html: Promise<string> }[] = [];
	for (const tok of tokens) {
		if (tok.type === 'fence') {
			const lang = (tok.info || '').trim().split(/\s+/)[0] || 'plaintext';
			const code = tok.content;
			const marker = `\u0000FORUM_CODE_${placeholders.length}\u0000`;
			placeholders.push({ marker, html: highlightCodeForForum(code, lang) });
			// 把 token 类型改成 html_block 注入占位
			tok.type = 'html_block';
			tok.content = marker;
			tok.tag = '';
			tok.info = '';
		}
	}
	const renderedWithMarkers = md.renderer.render(tokens, md.options, {});
	const safe = DOMPurify.sanitize(renderedWithMarkers, SANITIZE_OPTS) as unknown as string;
	let withLinks = applyExternalLinkTarget(safe);
	const resolved = await Promise.all(placeholders.map((p) => p.html));
	for (let i = 0; i < placeholders.length; i++) {
		// 替换占位块（DOMPurify 可能保留为 <p>marker</p>，做一次宽松替换）
		const m = placeholders[i].marker;
		const re = new RegExp(`(?:<p>\\s*)?${m}(?:\\s*</p>)?`, 'g');
		withLinks = withLinks.replace(re, resolved[i]);
	}
	return withLinks;
}

// 轻量 Markdown 工具：仅提供首图提取（用于帖子封面）。
export function extractFirstImageUrlFromMarkdown(markdownText?: string): string | undefined {
	if (!markdownText) return undefined;
	// 1. ![alt](url)
	const m = markdownText.match(/!\[[^\]]*\]\((\S+?)(?:\s+["'][^"']*["'])?\)/);
	if (m) return m[1];
	// 2. <img src="url">
	const html = markdownText.match(/<img[^>]+src=["']([^"']+)["']/i);
	if (html) return html[1];
	return undefined;
}

export function formatForumDateTime(value?: string | null): string {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}
