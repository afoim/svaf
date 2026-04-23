import { parseTimetableText } from '$lib/utils/timetable-parser';
import { buildTimetableViewModel, resolveCurrentWeek } from '$lib/utils/timetable-normalizer';
import { browser } from '$app/environment';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const response = await fetch('/timetable.json');
	const text = await response.text();
	const parsed = parseTimetableText(text);
	const currentWeek = resolveCurrentWeek(parsed.meta.startDate, parsed.meta.maxWeek);

	// 预渲染时不能访问 searchParams，仅在客户端读取 ?week=
	let selectedWeek = currentWeek;
	if (browser) {
		const requestedWeek = Number(url.searchParams.get('week'));
		if (Number.isInteger(requestedWeek) && requestedWeek > 0) {
			selectedWeek = requestedWeek;
		}
	}

	const viewModel = buildTimetableViewModel(parsed, selectedWeek);

	return {
		viewModel,
		baselineText: text,
		isCurrentWeek: viewModel.currentWeek === currentWeek
	};
};
