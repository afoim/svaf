import type {
	ParsedTimetableData,
	TimetableConfigSegment,
	TimetableCourseArrangement,
	TimetableCourseDefinition,
	TimetableMetaSegment,
	TimetableNodeTime,
} from '$lib/types/timetable';

const EXPECTED_SEGMENT_COUNT = 5;

function parseJsonLine<T>(line: string, lineNumber: number): T {
	const normalizedLine = line.endsWith(',') ? line.slice(0, -1) : line;
	try {
		return JSON.parse(normalizedLine) as T;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(
			`课表数据解析失败：第 ${lineNumber} 行不是合法 JSON（${message}）`
		);
	}
}

function ensureObject(
	value: unknown,
	index: number
): asserts value is Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`课表数据结构错误：第 ${index + 1} 段应为对象`);
	}
}

function ensureArray(value: unknown, index: number): asserts value is unknown[] {
	if (!Array.isArray(value)) {
		throw new Error(`课表数据结构错误：第 ${index + 1} 段应为数组`);
	}
}

export function parseTimetableText(rawText: string): ParsedTimetableData {
	const lines = rawText
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (lines.length !== EXPECTED_SEGMENT_COUNT) {
		throw new Error(
			`课表数据结构错误：必须恰好包含 ${EXPECTED_SEGMENT_COUNT} 段 JSON，当前为 ${lines.length} 段`
		);
	}

	const segments = lines.map((line, index) => parseJsonLine<unknown>(line, index + 1));
	const [config, nodeTimes, meta, courseDefinitions, arrangements] = segments;

	ensureObject(config, 0);
	ensureArray(nodeTimes, 1);
	ensureObject(meta, 2);
	ensureArray(courseDefinitions, 3);
	ensureArray(arrangements, 4);

	return {
		config: config as unknown as TimetableConfigSegment,
		nodeTimes: nodeTimes as TimetableNodeTime[],
		meta: meta as unknown as TimetableMetaSegment,
		courseDefinitions: courseDefinitions as TimetableCourseDefinition[],
		arrangements: arrangements as TimetableCourseArrangement[]
	};
}

export function serializeTimetableDataToFileText(data: ParsedTimetableData): string {
	const segments = [
		data.config,
		data.nodeTimes,
		data.meta,
		data.courseDefinitions,
		data.arrangements
	];
	return `${segments.map((segment) => JSON.stringify(segment)).join('\n')}\n`;
}
