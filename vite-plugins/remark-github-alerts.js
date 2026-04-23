/**
 * remark 插件：将 GitHub 风格的 > [!TIP] 块转换为带样式类的 div。
 * 同时容错支持无 > 前缀的段落形式（首行 [!tip]）。
 *   <div class="markdown-alert markdown-alert-tip">
 *     <div class="markdown-alert-title">…icon…<span>Tip</span></div>
 *     …原内容…
 *   </div>
 */

import { ALERT_REGEX, buildAlertTitleHtml } from './github-alerts-shared.js';

const DEBUG = process.env.DEBUG_ALERTS === '1';
const log = (...a) => DEBUG && console.log('[remark-alerts]', ...a);

function visit(node, type, fn) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const c of node) visit(c, type, fn);
		return;
	}
	if (node.type === type) fn(node);
	if (node.children) visit(node.children, type, fn);
}

function detectAlertType(paragraph) {
	const first = paragraph.children?.[0];
	if (!first) return null;

	// 形式 A：纯文本 "[!tip]"
	if (first.type === 'text') {
		const m = first.value.match(ALERT_REGEX);
		return m ? { type: m[1].toLowerCase(), via: 'text', match: m } : null;
	}
	// 形式 B：remark 把 [!tip] 解析成了 linkReference（shortcut）
	if (first.type === 'linkReference' && first.referenceType === 'shortcut') {
		const label = first.label || first.identifier || '';
		const m = label.match(/^!(NOTE|TIP|INFO|IMPORTANT|WARNING|CAUTION)$/i);
		return m ? { type: m[1].toLowerCase(), via: 'linkRef' } : null;
	}
	return null;
}

function stripAlertPrefix(paragraph) {
	const detected = detectAlertType(paragraph);
	if (!detected) return null;

	if (detected.via === 'text') {
		const firstChild = paragraph.children[0];
		firstChild.value = firstChild.value.slice(detected.match[0].length);
		if (!firstChild.value) paragraph.children.shift();
	} else {
		// 移除 linkReference 节点本身
		paragraph.children.shift();
	}

	// 清掉紧随的换行 / 空文本
	while (
		paragraph.children.length &&
		((paragraph.children[0].type === 'text' &&
			(!paragraph.children[0].value || /^[ \t]*\r?\n/.test(paragraph.children[0].value))) ||
			paragraph.children[0].type === 'break')
	) {
		const c = paragraph.children[0];
		if (c.type === 'text') {
			c.value = c.value.replace(/^[ \t]*\r?\n/, '');
			if (c.value) break;
		}
		paragraph.children.shift();
	}
	return detected.type;
}

function asAlertDiv(node, type, contentChildren) {
	node.type = 'paragraph'; // placeholder; we override hName below
	node.children = [
		{ type: 'html', value: buildAlertTitleHtml(type) },
		...contentChildren
	];
	node.data = node.data || {};
	node.data.hName = 'div';
	node.data.hProperties = { className: ['markdown-alert', `markdown-alert-${type}`] };
}

export default function remarkGithubAlerts() {
	return (tree, file) => {
		const fname = file?.filename || file?.path || '?';
		let bqCount = 0;
		let hits = 0;

		// 1) 标准形式：> [!TYPE]
		visit(tree, 'blockquote', (node) => {
			bqCount++;
			const firstPara = node.children?.[0];
			if (!firstPara || firstPara.type !== 'paragraph') {
				log(fname, 'bq#' + bqCount, 'skip: first child not paragraph, got', firstPara?.type);
				return;
			}
			const first = firstPara.children?.[0];
			log(
				fname,
				'bq#' + bqCount,
				'firstChild.type=' + first?.type,
				first?.type === 'text' ? JSON.stringify(first.value?.slice(0, 40)) : '',
				first?.type === 'linkReference' ? 'label=' + JSON.stringify(first.label) : ''
			);
			const type = stripAlertPrefix(firstPara);
			if (!type) return;
			hits++;
			log(fname, 'bq#' + bqCount, '✓ MATCH type=' + type);
			if (!firstPara.children.length) node.children.shift();

			node.children.unshift({ type: 'html', value: buildAlertTitleHtml(type) });
			node.data = node.data || {};
			node.data.hName = 'div';
			node.data.hProperties = { className: ['markdown-alert', `markdown-alert-${type}`] };
		});

		// 2) 容错形式：首行 [!TYPE] 的普通段落
		visit(tree, 'paragraph', (node) => {
			if (node.data?.hName === 'div') return;
			if (!detectAlertType(node)) return;
			const type = stripAlertPrefix(node);
			if (!type) return;
			hits++;
			log(fname, 'paragraph ✓ MATCH type=' + type);
			const content = node.children;
			asAlertDiv(node, type, content);
		});

		if (DEBUG && bqCount) log(fname, `summary: ${bqCount} blockquote(s), ${hits} alert(s) emitted`);
	};
}

