import type {
	ParsedTimetableData,
	TimetableCourseArrangement,
	TimetableCourseView,
	TimetableDayColumn,
	TimetableNodeRow,
	TimetableViewModel
} from '$lib/types/timetable';

const WEEKDAY_LABELS: Record<number, string> = {
	1: '周一',
	2: '周二',
	3: '周三',
	4: '周四',
	5: '周五',
	6: '周六',
	7: '周日'
};

function hashText(input: string): number {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash * 31 + input.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

export function parseArgbColor(raw: string): string | null {
	if (!raw || !raw.startsWith('#') || raw.length !== 9) return null;
	const r = raw.slice(3, 5);
	const g = raw.slice(5, 7);
	const b = raw.slice(7, 9);
	return `#${r}${g}${b}`;
}

function buildCourseColor(courseName: string, courseId: number, rawColor?: string): string {
	const parsed = parseArgbColor(rawColor ?? '');
	if (parsed) return parsed;
	const seed = hashText(`${courseName}-${courseId}`);
	const hue = seed % 360;
	return `hsl(${hue} 78% 68%)`;
}

function parseDateFromYmd(ymd: string): Date | null {
	const parts = ymd.split('-').map((part) => Number(part));
	if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
		return null;
	}
	const [year, month, day] = parts;
	return new Date(year, month - 1, day);
}

export function resolveCurrentWeek(
	startDateText: string,
	maxWeek: number,
	now: Date = new Date()
): number {
	const startDate = parseDateFromYmd(startDateText);
	if (!startDate) {
		return 1;
	}

	const msPerDay = 24 * 60 * 60 * 1000;
	const diffDays = Math.floor((now.getTime() - startDate.getTime()) / msPerDay);
	const week = Math.floor(diffDays / 7) + 1;

	if (week < 1) {
		return 1;
	}
	if (week > maxWeek) {
		return maxWeek;
	}
	return week;
}

function toNodeRows(data: ParsedTimetableData): TimetableNodeRow[] {
	const rows = data.nodeTimes
		.filter((item) => item.node >= 1 && item.node <= data.meta.nodes)
		.sort((a, b) => a.node - b.node)
		.map((item) => ({
			node: item.node,
			startTime: item.startTime,
			endTime: item.endTime
		}));

	if (rows.length > 0) {
		return rows;
	}

	return Array.from({ length: data.meta.nodes }, (_, index) => {
		const node = index + 1;
		return {
			node,
			startTime: '--:--',
			endTime: '--:--'
		};
	});
}

function toDayColumns(data: ParsedTimetableData): TimetableDayColumn[] {
	const columns: TimetableDayColumn[] = [
		{ day: 1, label: WEEKDAY_LABELS[1] },
		{ day: 2, label: WEEKDAY_LABELS[2] },
		{ day: 3, label: WEEKDAY_LABELS[3] },
		{ day: 4, label: WEEKDAY_LABELS[4] },
		{ day: 5, label: WEEKDAY_LABELS[5] }
	];

	if (data.meta.showSat) {
		columns.push({ day: 6, label: WEEKDAY_LABELS[6] });
	}
	if (data.meta.showSun) {
		columns.push({ day: 7, label: WEEKDAY_LABELS[7] });
	}
	return columns;
}

function toCourseView(
	arrangement: TimetableCourseArrangement,
	courseName: string,
	color: string,
	nodeRows: TimetableNodeRow[]
): TimetableCourseView {
	const durationNodes = arrangement.step;
	const maxNode = Math.max(...nodeRows.map((row) => row.node), arrangement.startNode);
	const endNode = Math.min(arrangement.startNode + durationNodes - 1, maxNode);
	const startNodeRow = nodeRows.find((row) => row.node === arrangement.startNode);
	const endNodeRow = nodeRows.find((row) => row.node === endNode);
	const startTime = startNodeRow?.startTime ?? '--:--';
	const endTime = endNodeRow?.endTime ?? '--:--';

	return {
		courseId: arrangement.id,
		courseName,
		color,
		teacher: arrangement.teacher?.trim() || '未填写',
		room: arrangement.room?.trim() || '未填写',
		day: arrangement.day,
		startNode: arrangement.startNode,
		endNode,
		durationNodes,
		startWeek: arrangement.startWeek,
		endWeek: arrangement.endWeek,
		nodeText: `第 ${arrangement.startNode}-${endNode} 节`,
		timeText: `${startTime} - ${endTime}`
	};
}

export function buildTimetableViewModel(
	data: ParsedTimetableData,
	selectedWeek: number
): TimetableViewModel {
	const maxWeek = Math.max(1, data.meta.maxWeek || 1);
	const week = Math.min(Math.max(1, selectedWeek), maxWeek);
	const nodeRows = toNodeRows(data);
	const dayColumns = toDayColumns(data);

	const courseMap = new Map(data.courseDefinitions.map((course) => [course.id, course]));

	const coursesByDay: Record<number, TimetableCourseView[]> = {};
	for (const column of dayColumns) {
		coursesByDay[column.day] = [];
	}

	for (const arrangement of data.arrangements) {
		if (arrangement.day < 1 || arrangement.day > 7) {
			continue;
		}
		if (week < arrangement.startWeek || week > arrangement.endWeek) {
			continue;
		}
		if (!(arrangement.day in coursesByDay)) {
			continue;
		}

		const courseDef = courseMap.get(arrangement.id);
		const courseName = courseDef?.courseName ?? `课程 #${arrangement.id}`;
		const color = buildCourseColor(courseName, arrangement.id, courseDef?.color);
		coursesByDay[arrangement.day].push(toCourseView(arrangement, courseName, color, nodeRows));
	}

	for (const day of Object.keys(coursesByDay)) {
		coursesByDay[Number(day)].sort(
			(a, b) => a.startNode - b.startNode || a.courseName.localeCompare(b.courseName)
		);
	}

	return {
		tableName: data.meta.tableName || '课表',
		maxWeek,
		currentWeek: week,
		weeks: Array.from({ length: maxWeek }, (_, index) => index + 1),
		dayColumns,
		nodeRows,
		coursesByDay
	};
}
