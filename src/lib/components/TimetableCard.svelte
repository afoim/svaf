<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { onMount } from 'svelte';

	interface TimetableCourseView {
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

	interface TimetablePayload {
		coursesByDay: Record<number, TimetableCourseView[]>;
	}

	let status = $state<string>('加载中...');
	let nextDetail = $state<string>('--');
	let nextTail = $state<string>('');
	let nextColor = $state<string>('');
	let statusColor = $state<string>('');
	let isVisible = $state<boolean>(false);

	function parseTimeToMinute(text: string): number | null {
		const parts = String(text || '').split(':');
		if (parts.length !== 2) return null;
		const hour = Number(parts[0]);
		const minute = Number(parts[1]);
		if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
		return hour * 60 + minute;
	}

	function extractRangeMinutes(timeText: string): { startMinute: number; endMinute: number } | null {
		const match = String(timeText || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
		if (!match) return null;
		const startMinute = parseTimeToMinute(match[1]);
		const endMinute = parseTimeToMinute(match[2]);
		if (startMinute === null || endMinute === null) return null;
		return { startMinute, endMinute };
	}

	function formatDuration(totalMinutes: number): string {
		const safeMinutes = Math.max(0, Math.floor(totalMinutes));
		const hours = Math.floor(safeMinutes / 60);
		const minutes = safeMinutes % 60;
		if (hours > 0 && minutes > 0) return `${hours}小时${minutes}分钟`;
		if (hours > 0) return `${hours}小时`;
		return `${minutes}分钟`;
	}

	function getTodayCourses(payload: TimetablePayload, now: Date) {
		const day = now.getDay() === 0 ? 7 : now.getDay();
		const rawCourses = payload?.coursesByDay?.[day] || [];
		return rawCourses
			.map((course) => {
				const range = extractRangeMinutes(course.timeText);
				if (!range) return null;
				return {
					...course,
					startMinute: range.startMinute,
					endMinute: range.endMinute
				};
			})
			.filter(Boolean)
			.sort((a, b) => a!.startMinute - b!.startMinute);
	}

	function resolveLiveState(payload: TimetablePayload) {
		const now = new Date();
		const currentMinute = now.getHours() * 60 + now.getMinutes();
		const day = now.getDay() === 0 ? 7 : now.getDay();

		if (day >= 6) {
			return {
				status: '周末',
				nextDetail: '--',
				nextTail: '',
				nextColor: '',
				statusColor: ''
			};
		}

		const courses = getTodayCourses(payload, now);
		if (courses.length === 0) {
			return {
				status: '无课',
				nextDetail: '--',
				nextTail: '',
				nextColor: '',
				statusColor: ''
			};
		}

		let currentStatus = '无课';
		let statusColor = '';
		for (let index = 0; index < courses.length; index += 1) {
			const current = courses[index]!;
			if (currentMinute >= current.startMinute && currentMinute < current.endMinute) {
				currentStatus = `上课（${current.courseName}）`;
				statusColor = current.color;
				break;
			}
			const next = courses[index + 1];
			if (next && currentMinute >= current.endMinute && currentMinute < next.startMinute) {
				currentStatus = `课间（下一节：${next.courseName}）`;
				statusColor = next.color;
				break;
			}
		}

		const nextCourse = courses.find((course) => course!.startMinute > currentMinute) || null;
		if (!nextCourse) {
			return {
				status: currentStatus,
				nextDetail: '--',
				nextTail: '',
				nextColor: '',
				statusColor: statusColor
			};
		}

		const remainMinutes = nextCourse.startMinute - currentMinute;
		return {
			status: currentStatus,
			nextDetail: `${nextCourse.courseName} - ${nextCourse.room || '未填写'}`,
			nextTail: `（${formatDuration(remainMinutes)}后）`,
			nextColor: nextCourse.color || '',
			statusColor: statusColor
		};
	}

	async function loadTimetableData(): Promise<TimetablePayload> {
		const response = await fetch('/timetable.json');
		const lines = (await response.text()).split('\n');
		
		// Parse the JSON lines
		const config = JSON.parse(lines[0]);
		const nodeTimes = JSON.parse(lines[1]);
		const meta = JSON.parse(lines[2]);
		const courseDefinitions = JSON.parse(lines[3]);
		const arrangements = JSON.parse(lines[4]);

		// Build coursesByDay
		const coursesByDay: Record<number, TimetableCourseView[]> = {};
		
		for (const arr of arrangements) {
			const courseDef = courseDefinitions.find((c: any) => c.id === arr.id);
			if (!courseDef) continue;

			const startNode = arr.startNode;
			const endNode = startNode + arr.step - 1;
			const nodeTime = nodeTimes.find((nt: any) => nt.node === startNode);
			
			if (!nodeTime) continue;

			const endNodeTime = nodeTimes.find((nt: any) => nt.node === endNode);
			const timeText = endNodeTime 
				? `${nodeTime.startTime} - ${endNodeTime.endTime}`
				: `${nodeTime.startTime} - ${nodeTime.endTime}`;

			const course: TimetableCourseView = {
				courseId: arr.id,
				courseName: courseDef.courseName,
				color: courseDef.color || '#000000',
				teacher: arr.teacher || '',
				room: arr.room || '',
				day: arr.day,
				startNode: arr.startNode,
				endNode: endNode,
				durationNodes: arr.step,
				startWeek: arr.startWeek,
				endWeek: arr.endWeek,
				nodeText: `第${startNode}节`,
				timeText: timeText
			};

			if (!coursesByDay[arr.day]) {
				coursesByDay[arr.day] = [];
			}
			coursesByDay[arr.day].push(course);
		}

		return { coursesByDay };
	}

	function updateStatus(payload: TimetablePayload) {
		const state = resolveLiveState(payload);
		status = state.status;
		nextDetail = state.nextDetail;
		nextTail = state.nextTail;
		nextColor = state.nextColor;
		statusColor = state.statusColor;
		isVisible = true;
	}

	onMount(async () => {
		try {
			const payload = await loadTimetableData();
			updateStatus(payload);

			// Update every 30 seconds
			const interval = setInterval(() => {
				updateStatus(payload);
			}, 30000);

			return () => clearInterval(interval);
		} catch (error) {
			console.error('Failed to load timetable:', error);
			status = '加载失败';
			isVisible = true;
		}
	});
</script>

<a href="/timetable/" class="block transition-transform hover:-translate-y-0.5">
	<Card class="opacity-0 transition-opacity duration-300" style="opacity: {isVisible ? 1 : 0}">
		<CardContent class="p-3">
			<p class="text-xs font-semibold transition-colors" style="color: {statusColor || 'inherit'}">{status}</p>
			<p class="mt-1 text-xs text-muted-foreground">
				<span>下一堂课：</span>
				<span class="font-medium transition-colors" style="color: {nextColor || 'inherit'}">{nextDetail}</span>
				<span class="ml-0.5">{nextTail}</span>
			</p>
		</CardContent>
	</Card>
</a>
