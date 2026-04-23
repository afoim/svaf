/**
 * GitHub 风格提示块的共享常量：类型、图标、标题。
 * 文章侧（remark）与论坛侧（markdown-it）都引用此文件，
 * 以保证两端输出 HTML 结构一致，可共用同一份样式。
 */

export const ALERT_TYPES = ['note', 'tip', 'info', 'important', 'warning', 'caution'];

export const ALERT_LABELS = {
	note: 'Note',
	tip: 'Tip',
	info: 'Info',
	important: 'Important',
	warning: 'Warning',
	caution: 'Caution'
};

const SVG_ATTRS =
	'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

export const ALERT_ICONS = {
	note: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
	tip: `<svg ${SVG_ATTRS}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
	info: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
	important: `<svg ${SVG_ATTRS}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`,
	warning: `<svg ${SVG_ATTRS}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
	caution: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`
};

export const ALERT_REGEX = /^\[!(NOTE|TIP|INFO|IMPORTANT|WARNING|CAUTION)\][ \t]*\r?\n?/i;

export function buildAlertTitleHtml(type) {
	const label = ALERT_LABELS[type] ?? type;
	const icon = ALERT_ICONS[type] ?? '';
	return `<div class="markdown-alert-title">${icon}<span>${label}</span></div>`;
}
