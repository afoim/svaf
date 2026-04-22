#!/usr/bin/env node
// 批量将 @hugeicons/svelte + @hugeicons/core-free-icons 替换为 @iconify/svelte
// 用法: node scripts/replace-hugeicons.js

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

// PascalCase Icon 名 -> iconify hugeicons collection 名
// 规则: 去掉末尾的 "Icon"，将 PascalCase 转为 kebab-case
function pascalToKebab(name) {
	const base = name.replace(/Icon$/, '');
	return base
		// 在大写字母前加 -，但保留连续大写/数字
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.replace(/([a-zA-Z])(\d)/g, '$1-$2')
		.toLowerCase();
}

// 找出所有 svelte 文件
const files = execSync('git ls-files "*.svelte"', { encoding: 'utf8' })
	.split('\n')
	.filter(Boolean);

const missing = [];
let changedCount = 0;

for (const file of files) {
	const abs = path.resolve(file);
	let src = readFileSync(abs, 'utf8');
	const original = src;

	if (!/@hugeicons\//.test(src)) continue;

	// 1) 收集所有从 @hugeicons/core-free-icons 导入的 Icon 名
	const importedIcons = new Map(); // PascalName -> kebab
	src = src.replace(
		/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@hugeicons\/core-free-icons['"]\s*;?\s*\n?/g,
		(_m, names) => {
			for (const raw of names.split(',')) {
				const n = raw.trim();
				if (!n) continue;
				importedIcons.set(n, `hugeicons:${pascalToKebab(n)}`);
			}
			return '';
		}
	);

	// 2) 移除 HugeiconsIcon 的 import
	src = src.replace(
		/import\s*\{\s*HugeiconsIcon\s*\}\s*from\s*["']@hugeicons\/svelte["']\s*;?\s*\n?/g,
		''
	);

	// 3) 如果文件已经有 Icon import 就不再加，否则加上
	const hasIconifyImport = /from\s*['"]@iconify\/svelte['"]/.test(src);
	if (!hasIconifyImport) {
		// 在第一个 <script> 标签的 lang 属性后插入
		src = src.replace(
			/(<script[^>]*>\s*\n)/,
			`$1\timport Icon from '@iconify/svelte';\n`
		);
	}

	// 4) 替换 <HugeiconsIcon icon={XxxIcon} ... /> 为 <Icon icon="hugeicons:xxx" ... />
	// 处理自闭合
	src = src.replace(
		/<HugeiconsIcon\b([^/>]*?)\/>/g,
		(m, attrs) => {
			return `<Icon${convertAttrs(attrs, importedIcons, missing, file)} />`;
		}
	);
	// 处理开/闭标签
	src = src.replace(
		/<HugeiconsIcon\b([^>]*?)>([\s\S]*?)<\/HugeiconsIcon>/g,
		(m, attrs, inner) => {
			return `<Icon${convertAttrs(attrs, importedIcons, missing, file)}>${inner}</Icon>`;
		}
	);

	if (src !== original) {
		writeFileSync(abs, src, 'utf8');
		changedCount++;
		console.log(`✓ ${file}`);
	}
}

function convertAttrs(attrs, importedIcons, missing, file) {
	// 1) icon={XxxIcon} -> icon="hugeicons:xxx"
	attrs = attrs.replace(/\bicon=\{([A-Za-z0-9_]+)\}/g, (_m, name) => {
		const kebab = importedIcons.get(name);
		if (!kebab) {
			missing.push({ file, name });
			return `icon="hugeicons:${pascalToKebab(name)}"`;
		}
		return `icon="${kebab}"`;
	});
	// 2) 移除 strokeWidth={...}（iconify/svelte 不支持该属性）
	attrs = attrs.replace(/\s*strokeWidth=\{[^}]*\}/g, '');
	return attrs;
}

console.log(`\n完成。修改了 ${changedCount} 个文件。`);
if (missing.length) {
	console.log('\n⚠️  这些 Icon 未在文件中找到 import，已按命名规则猜测，请人工检查:');
	for (const m of missing) console.log(`  - ${m.file}: ${m.name}`);
}
