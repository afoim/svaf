import { parseTimetableText } from '$lib/utils/timetable-parser';
import { buildTimetableViewModel, resolveCurrentWeek } from '$lib/utils/timetable-normalizer';
import type { PageLoad } from './$types';
import type { EntryGenerator } from './$types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const entries: EntryGenerator = () => {
	try {
		// 在构建时读取课程表数据
		const filePath = join(process.cwd(), 'static', 'timetable.json');
		const text = readFileSync(filePath, 'utf-8');
		const parsed = parseTimetableText(text);
		
		// 生成所有周的路由
		const weeks = [];
		for (let i = 1; i <= parsed.meta.maxWeek; i++) {
			weeks.push({ week: String(i) });
		}
		
		console.log('[Timetable Entries] 预渲染周数:', weeks.length);
		return weeks;
	} catch (error) {
		console.error('[Timetable Entries] 读取失败:', error);
		// 默认生成 20 周
		return Array.from({ length: 20 }, (_, i) => ({ week: String(i + 1) }));
	}
};

export const load: PageLoad = async ({ params, fetch }) => {
	const week = Number(params.week);
	console.log('[Timetable Load] 加载指定周:', week);
	const response = await fetch('/timetable.json');
	const text = await response.text();
	const parsed = parseTimetableText(text);
	const currentWeek = resolveCurrentWeek(parsed.meta.startDate, parsed.meta.maxWeek);
	console.log('[Timetable Load] 解析完成，请求周:', week, '当前周:', currentWeek);
	const viewModel = buildTimetableViewModel(parsed, week);
	
	return {
		viewModel,
		baselineText: text,
		isCurrentWeek: week === currentWeek
	};
};
