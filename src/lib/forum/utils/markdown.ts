// 轻量 Markdown 工具：仅提供首图提取（用于帖子封面）。
// 完整 Markdown 渲染留待帖子详情页阶段再引入 markdown-it / sanitize-html。
export function extractFirstImageUrlFromMarkdown(markdownText?: string): string | undefined {
	if (!markdownText) return undefined;
	// 1. ![alt](url)
	const md = markdownText.match(/!\[[^\]]*\]\((\S+?)(?:\s+["'][^"']*["'])?\)/);
	if (md) return md[1];
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
