import { parseTimetableText } from '$lib/utils/timetable-parser';
import { buildTimetableViewModel, resolveCurrentWeek } from '$lib/utils/timetable-normalizer';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	console.log('[Timetable Load] 加载默认页面（当前周）');
	const response = await fetch('/timetable.json');
	const text = await response.text();
	const parsed = parseTimetableText(text);
	const currentWeek = resolveCurrentWeek(parsed.meta.startDate, parsed.meta.maxWeek);
	console.log('[Timetable Load] 解析完成，当前周:', currentWeek);
	const viewModel = buildTimetableViewModel(parsed, currentWeek);
	
	return {
		viewModel,
		baselineText: text,
		isCurrentWeek: true
	};
};
