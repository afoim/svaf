import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// 读取所有赞助者 JSON 文件
		const sponsorFiles = import.meta.glob('/static/sponsors/lists/*.json', { eager: true });
		
		const sponsors = Object.values(sponsorFiles).map((file: any) => file.default);
		
		// 按日期排序（最新的在前）
		sponsors.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		return json(sponsors);
	} catch (error) {
		console.error('Failed to load sponsors:', error);
		return json([]);
	}
};
