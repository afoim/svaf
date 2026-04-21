export interface TimetableConfigSegment {
	courseLen: number;
	id: number;
	name: string;
}

export interface TimetableNodeTime {
	node: number;
	startTime: string;
	endTime: string;
	timeTable: number;
}

export interface TimetableMetaSegment {
	id: number;
	tableName: string;
	maxWeek: number;
	nodes: number;
	startDate: string;
	timeTable: number;
	showSat?: boolean;
	showSun?: boolean;
}

export interface TimetableCourseDefinition {
	id: number;
	courseName: string;
	color?: string;
}

export interface TimetableCourseArrangement {
	id: number;
	day: number;
	startNode: number;
	step: number;
	startWeek: number;
	endWeek: number;
	teacher?: string;
	room?: string;
}

export interface ParsedTimetableData {
	config: TimetableConfigSegment;
	nodeTimes: TimetableNodeTime[];
	meta: TimetableMetaSegment;
	courseDefinitions: TimetableCourseDefinition[];
	arrangements: TimetableCourseArrangement[];
}

export interface TimetableCourseView {
	courseId: number;
	courseName: string;
	color: string;
	teacher: string;
	room: string;
	day: number;
	startNode: number;
	endNode: number;
	durationNodes: number;
	startWeek: number;
	endWeek: number;
	nodeText: string;
	timeText: string;
}

export interface TimetableDayColumn {
	day: number;
	label: string;
}

export interface TimetableNodeRow {
	node: number;
	startTime: string;
	endTime: string;
}

export interface TimetableViewModel {
	tableName: string;
	maxWeek: number;
	currentWeek: number;
	weeks: number[];
	dayColumns: TimetableDayColumn[];
	nodeRows: TimetableNodeRow[];
	coursesByDay: Record<number, TimetableCourseView[]>;
}
