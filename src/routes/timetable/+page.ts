import { parseTimetableText } from '$lib/utils/timetable-parser';
import { buildTimetableViewModel, resolveCurrentWeek } from '$lib/utils/timetable-normalizer';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/timetable.json');
	const text = await response.text();
	const parsed = parseTimetableText(text);
	const currentWeek = resolveCurrentWeek(parsed.meta.startDate, parsed.meta.maxWeek);
	const viewModel = buildTimetableViewModel(parsed, currentWeek);
	
	return {
		viewModel,
		baselineText: text,
		isCurrentWeek: true
	};
};
