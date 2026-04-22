import fs from 'node:fs';
import path from 'node:path';
import type { PageServerLoad } from './$types';

export const prerender = true;

export interface FileItem {
	name: string;
	path: string;
	type: 'file' | 'directory';
	size?: number;
	mtime?: string;
	children?: FileItem[];
}

const EXCLUDE = new Set(['.DS_Store', '.gitkeep', 'Thumbs.db']);

function getFiles(dir: string, baseDir = ''): FileItem[] {
	if (!fs.existsSync(dir)) return [];
	const entries = fs.readdirSync(dir);
	const result: FileItem[] = [];

	for (const entry of entries) {
		if (EXCLUDE.has(entry)) continue;
		const filePath = path.join(dir, entry);
		const stats = fs.statSync(filePath);
		const relativePath = path.join(baseDir, entry).replace(/\\/g, '/');

		if (stats.isDirectory()) {
			result.push({
				name: entry,
				path: relativePath,
				type: 'directory',
				children: getFiles(filePath, relativePath)
			});
		} else {
			result.push({
				name: entry,
				path: relativePath,
				type: 'file',
				size: stats.size,
				mtime: stats.mtime.toISOString()
			});
		}
	}

	return result.sort((a, b) => {
		if (a.type === b.type) return a.name.localeCompare(b.name);
		return a.type === 'directory' ? -1 : 1;
	});
}

export const load: PageServerLoad = () => {
	const filesDir = path.join(process.cwd(), 'static', 'files');
	const fileTree = getFiles(filesDir, 'files');
	return { fileTree };
};
