import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// 读取所有友链 JSON 文件
		const friendFiles = import.meta.glob('/static/friends/lists/*.json', { eager: true });
		
		const friends = Object.values(friendFiles).map((file: any) => file.default);
		
		// 按名称排序
		friends.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
		
		return json(friends);
	} catch (error) {
		console.error('Failed to load friends:', error);
		return json([]);
	}
};
