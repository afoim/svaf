import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

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

export function renderForumMarkdown(text?: string): string {
	if (!text) return '';
	const raw = md.render(text);
	const safe = DOMPurify.sanitize(raw, {
		ADD_ATTR: ['target', 'rel', 'loading', 'referrerpolicy'],
		ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i
	});
	return applyExternalLinkTarget(safe);
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
