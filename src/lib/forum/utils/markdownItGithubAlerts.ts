/**
 * markdown-it 插件：识别 > [!TIP] 等 GitHub 风格提示块，
 * 将外层 blockquote 改写为 <div class="markdown-alert markdown-alert-tip">，
 * 并在其首部插入标题节点。同时容错支持无 > 前缀的段落形式（首行 [!tip]）。
 * 输出结构与文章侧 remark 插件一致。
 */

import type MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token';
import {
	ALERT_REGEX,
	buildAlertTitleHtml,
	ALERT_TYPES
} from '../../../../vite-plugins/github-alerts-shared.js';

const DEBUG =
	(typeof window !== 'undefined' && (window as any).__DEBUG_ALERTS__) ||
	(typeof process !== 'undefined' && process.env?.DEBUG_ALERTS === '1');
const log = (...a: unknown[]) => DEBUG && console.log('[md-alerts]', ...a);

function trimInline(inline: Token, consumedLen: number) {
	inline.content = inline.content.slice(consumedLen).replace(/^\r?\n/, '');
	if (inline.children && inline.children.length) {
		const first = inline.children[0];
		if (first.type === 'text') {
			const tagMatch = first.content.match(/^\[![A-Za-z]+\][ \t]*/);
			if (tagMatch) first.content = first.content.slice(tagMatch[0].length);
		}
		while (
			inline.children.length &&
			((inline.children[0].type === 'text' && !inline.children[0].content) ||
				inline.children[0].type === 'softbreak' ||
				inline.children[0].type === 'hardbreak')
		) {
			inline.children.shift();
		}
	}
}

export default function markdownItGithubAlerts(md: MarkdownIt) {
	md.core.ruler.after('block', 'github_alerts', (state) => {
		const tokens = state.tokens;
		log('scanning', tokens.length, 'tokens');
		for (let i = 0; i < tokens.length; i++) {
			const open = tokens[i];

			if (open.type === 'blockquote_open') {
				const pOpen = tokens[i + 1];
				const inline = tokens[i + 2];
				log(
					'blockquote@' + i,
					'next types =',
					pOpen?.type,
					inline?.type,
					'inline.content=',
					JSON.stringify(inline?.content?.slice(0, 60))
				);
				if (!pOpen || pOpen.type !== 'paragraph_open') continue;
				if (!inline || inline.type !== 'inline') continue;

				const match = inline.content.match(ALERT_REGEX);
				if (!match) {
					log('  no regex match');
					continue;
				}
				const type = match[1].toLowerCase();
				if (!ALERT_TYPES.includes(type)) continue;
				log('  ✓ MATCH bq type=' + type);

				trimInline(inline, match[0].length);

				open.tag = 'div';
				const existing = open.attrGet('class');
				const cls = `markdown-alert markdown-alert-${type}${existing ? ' ' + existing : ''}`;
				open.attrSet('class', cls);

				let depth = 1;
				for (let j = i + 1; j < tokens.length; j++) {
					if (tokens[j].type === 'blockquote_open') depth++;
					else if (tokens[j].type === 'blockquote_close') {
						depth--;
						if (depth === 0) {
							tokens[j].tag = 'div';
							break;
						}
					}
				}

				const titleToken = new state.Token('html_block', '', 0);
				titleToken.content = buildAlertTitleHtml(type) + '\n';
				tokens.splice(i + 1, 0, titleToken);
				continue;
			}

			// 形式 2：容错——无 > 前缀的段落，首行为 [!TYPE]
			if (open.type === 'paragraph_open') {
				const inline = tokens[i + 1];
				const close = tokens[i + 2];
				if (!inline || inline.type !== 'inline') continue;
				if (!close || close.type !== 'paragraph_close') continue;

				const match = inline.content.match(ALERT_REGEX);
				if (!match) continue;
				const type = match[1].toLowerCase();
				if (!ALERT_TYPES.includes(type)) continue;

				trimInline(inline, match[0].length);

				open.tag = 'div';
				close.tag = 'div';
				const existing = open.attrGet('class');
				const cls = `markdown-alert markdown-alert-${type}${existing ? ' ' + existing : ''}`;
				open.attrSet('class', cls);

				const titleToken = new state.Token('html_block', '', 0);
				titleToken.content = buildAlertTitleHtml(type) + '\n';
				tokens.splice(i + 1, 0, titleToken);
			}
		}
	});
}

