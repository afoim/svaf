import { parseTimetableText } from '$lib/utils/timetable-parser';
import { buildTimetableViewModel, resolveCurrentWeek } from '$lib/utils/timetable-normalizer';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const response = await fetch('/timetable.json');
	const text = await response.text();
	const parsed = parseTimetableText(text);
	const currentWeek = resolveCurrentWeek(parsed.meta.startDate, parsed.meta.maxWeek);
	const requestedWeek = Number(url.searchParams.get('week'));
	const selectedWeek = Number.isInteger(requestedWeek) && requestedWeek > 0 ? requestedWeek : currentWeek;
	const viewModel = buildTimetableViewModel(parsed, selectedWeek);
	
	return {
		viewModel,
		baselineText: text,
		isCurrentWeek: viewModel.currentWeek === currentWeek
	};
};
