import { parseTimetableText } from '$lib/utils/timetable-parser';
import { buildTimetableViewModel, resolveCurrentWeek } from '$lib/utils/timetable-normalizer';
import type { PageLoad } from './$types';

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
