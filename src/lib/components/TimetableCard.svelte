<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

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

	interface StatusLine {
		text: string;
		color?: string;
		strikethrough?: boolean;
		bold?: boolean;
	}

	// 全局会话状态存储
	const TIMETABLE_STATE_KEY = '__timetable_card_state__';
	
	interface GlobalState {
		payload: TimetablePayload | null;
		statusLines: StatusLine[][];
		intervalId: number | null;
	}

	// 从全局状态获取或初始化
	function getGlobalState(): GlobalState {
		if (typeof window === 'undefined') {
			return { payload: null, statusLines: [], intervalId: null };
		}
		
		if (!(window as any)[TIMETABLE_STATE_KEY]) {
			(window as any)[TIMETABLE_STATE_KEY] = {
				payload: null,
				statusLines: [],
				intervalId: null
			};
		}
		
		return (window as any)[TIMETABLE_STATE_KEY];
	}

	const globalState = getGlobalState();
	let statusLines = $state<StatusLine[][]>(globalState.statusLines);

	// 监听全局状态变化并同步到本地状态
	let syncInterval: number | null = null;

	function hexToRgb(hex: string): string {
		// Remove # if present
		hex = hex.replace('#', '');
		
		// Handle 8-digit hex (ARGB format from Android)
		if (hex.length === 8) {
			// Skip alpha channel (first 2 chars) and use RGB
			const r = parseInt(hex.substring(2, 4), 16);
			const g = parseInt(hex.substring(4, 6), 16);
			const b = parseInt(hex.substring(6, 8), 16);
			return `rgb(${r}, ${g}, ${b})`;
		}
		
		// Handle 6-digit hex
		if (hex.length === 6) {
			const r = parseInt(hex.substring(0, 2), 16);
			const g = parseInt(hex.substring(2, 4), 16);
			const b = parseInt(hex.substring(4, 6), 16);
			return `rgb(${r}, ${g}, ${b})`;
		}
		
		return 'rgb(0, 0, 0)';
	}

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

	function formatDuration(totalSeconds: number): string {
		const safeSecs = Math.max(0, Math.floor(totalSeconds));
		const days = Math.floor(safeSecs / 86400);
		const hours = Math.floor((safeSecs % 86400) / 3600);
		const minutes = Math.floor((safeSecs % 3600) / 60);
		const seconds = safeSecs % 60;
		
		const parts: string[] = [];
		if (days > 0) parts.push(`${days}天`);
		if (hours > 0) parts.push(`${hours}时`);
		if (minutes > 0) parts.push(`${minutes}分钟`);
		if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`);
		
		return parts.join('，');
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

	function getAllCoursesThisWeek(payload: TimetablePayload): any[] {
		const allCourses: any[] = [];
		for (let day = 1; day <= 7; day++) {
			const dayCourses = payload?.coursesByDay?.[day] || [];
			for (const course of dayCourses) {
				const range = extractRangeMinutes(course.timeText);
				if (range) {
					allCourses.push({
						...course,
						day,
						startMinute: range.startMinute,
						endMinute: range.endMinute
					});
				}
			}
		}
		return allCourses.sort((a, b) => {
			if (a.day !== b.day) return a.day - b.day;
			return a.startMinute - b.startMinute;
		});
	}

	function resolveLiveState(payload: TimetablePayload): StatusLine[][] {
		const now = new Date();
		const currentSecond = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
		const currentMinute = Math.floor(currentSecond / 60);
		const day = now.getDay() === 0 ? 7 : now.getDay();

		// 周末
		if (day >= 6) {
			const allCourses = getAllCoursesThisWeek(payload);
			const nextWeekFirstCourse = allCourses.find(c => c.day === 1);
			
			if (nextWeekFirstCourse) {
				const daysUntilMonday = day === 6 ? 2 : 1;
				const secondsUntilCourse = daysUntilMonday * 86400 + nextWeekFirstCourse.startMinute * 60 - (currentMinute * 60 + now.getSeconds());
				
				return [
					[{ text: '### 本周课毕' }],
					[
						{ text: '下周首节：' },
						{ text: `${nextWeekFirstCourse.courseName} - ${nextWeekFirstCourse.room || '未知'}`, bold: true, color: hexToRgb(nextWeekFirstCourse.color) }
					],
					[
						{ text: '距上课还有：' },
						{ text: formatDuration(secondsUntilCourse), bold: true }
					]
				];
			}
			
			return [[{ text: '### 周末' }]];
		}

		const courses = getTodayCourses(payload, now);
		
		// 今日无课
		if (courses.length === 0) {
			const allCourses = getAllCoursesThisWeek(payload);
			const nextDayCourse = allCourses.find(c => c.day > day);
			
			if (nextDayCourse) {
				const daysUntil = nextDayCourse.day - day;
				const secondsUntilCourse = daysUntil * 86400 + nextDayCourse.startMinute * 60 - (currentMinute * 60 + now.getSeconds());
				
				return [
					[{ text: '### 今日课毕' }],
					[
						{ text: '翌日首节：' },
						{ text: `${nextDayCourse.courseName} - ${nextDayCourse.room || '未知'}`, bold: true, color: hexToRgb(nextDayCourse.color) }
					],
					[
						{ text: '距上课还有：' },
						{ text: formatDuration(secondsUntilCourse), bold: true }
					]
				];
			}
			
			return [[{ text: '### 今日无课' }]];
		}

		// 查找当前状态
		for (let index = 0; index < courses.length; index += 1) {
			const current = courses[index]!;
			const prev = index > 0 ? courses[index - 1]! : null;
			const next = courses[index + 1] || null;
			
			// 上课中
			if (currentMinute >= current.startMinute && currentMinute < current.endMinute) {
				const remainSeconds = current.endMinute * 60 - currentSecond;
				
				return [
					[{ text: '### 上课' }],
					...(prev ? [[
						{ text: '上节：', strikethrough: true },
						{ text: `${prev.courseName} - ${prev.room || '未知'}`, strikethrough: true, color: hexToRgb(prev.color) }
					]] : []),
					[
						{ text: '本节：' },
						{ text: `${current.courseName} - ${current.room || '未知'}`, bold: true, color: hexToRgb(current.color) }
					],
					...(next ? [[
						{ text: '下节：' },
						{ text: `${next.courseName} - ${next.room || '未知'}`, color: hexToRgb(next.color) }
					]] : []),
					[
						{ text: '距下课还有：' },
						{ text: formatDuration(remainSeconds), bold: true }
					]
				];
			}
			
			// 课间
			if (next && currentMinute >= current.endMinute && currentMinute < next.startMinute) {
				const remainSeconds = next.startMinute * 60 - currentSecond;
				
				return [
					[{ text: '### 课间' }],
					[
						{ text: '上节：', strikethrough: true },
						{ text: `${current.courseName} - ${current.room || '未知'}`, strikethrough: true, color: hexToRgb(current.color) }
					],
					[
						{ text: '下节：' },
						{ text: `${next.courseName} - ${next.room || '未知'}`, bold: true, color: hexToRgb(next.color) }
					],
					[
						{ text: '距上课还有：' },
						{ text: formatDuration(remainSeconds), bold: true }
					]
				];
			}
		}

		// 今日课毕
		const lastCourse = courses[courses.length - 1]!;
		if (currentMinute >= lastCourse.endMinute) {
			const allCourses = getAllCoursesThisWeek(payload);
			const nextDayCourse = allCourses.find(c => c.day > day);
			
			if (nextDayCourse) {
				const daysUntil = nextDayCourse.day - day;
				const secondsUntilCourse = daysUntil * 86400 + nextDayCourse.startMinute * 60 - (currentMinute * 60 + now.getSeconds());
				
				return [
					[{ text: '### 今日课毕' }],
					[
						{ text: '翌日首节：' },
						{ text: `${nextDayCourse.courseName} - ${nextDayCourse.room || '未知'}`, bold: true, color: hexToRgb(nextDayCourse.color) }
					],
					[
						{ text: '距上课还有：' },
						{ text: formatDuration(secondsUntilCourse), bold: true }
					]
				];
			}
			
			return [[{ text: '### 今日课毕' }]];
		}

		// 第一节课前
		const firstCourse = courses[0]!;
		const remainSeconds = firstCourse.startMinute * 60 - currentSecond;
		
		return [
			[{ text: '### 课前' }],
			[
				{ text: '首节：' },
				{ text: `${firstCourse.courseName} - ${firstCourse.room || '未知'}`, bold: true, color: hexToRgb(firstCourse.color) }
			],
			[
				{ text: '距上课还有：' },
				{ text: formatDuration(remainSeconds), bold: true }
			]
		];
	}

	async function loadTimetableData(): Promise<TimetablePayload> {
		const response = await fetch('/timetable.json');
		const lines = (await response.text()).split('\n');
		
		// Parse the JSON lines
		JSON.parse(lines[0]); // config
		const nodeTimes = JSON.parse(lines[1]);
		JSON.parse(lines[2]); // meta
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
		const newStatusLines = resolveLiveState(payload);
		statusLines = newStatusLines;
		globalState.statusLines = newStatusLines;
	}

	onMount(() => {
		const state = getGlobalState();
		
		// 同步全局状态到本地（每100ms检查一次）
		syncInterval = window.setInterval(() => {
			if (state.statusLines !== statusLines) {
				statusLines = state.statusLines;
			}
		}, 100);
		
		// 如果已经有数据，直接使用
		if (state.payload) {
			statusLines = state.statusLines;
			
			// 确保定时器在运行
			if (state.intervalId === null) {
				state.intervalId = window.setInterval(() => {
					if (state.payload) {
						updateStatus(state.payload);
					}
				}, 1000);
			}
			return;
		}

		// 首次加载数据
		loadTimetableData()
			.then((payload) => {
				state.payload = payload;
				updateStatus(payload);

				// 启动定时器（全局唯一）
				if (state.intervalId === null) {
					state.intervalId = window.setInterval(() => {
						if (state.payload) {
							updateStatus(state.payload);
						}
					}, 1000);
				}
			})
			.catch((error) => {
				console.error('Failed to load timetable:', error);
				const errorLines = [[{ text: '### 加载失败' }]];
				statusLines = errorLines;
				state.statusLines = errorLines;
			});
	});

	onDestroy(() => {
		// 清理同步定时器
		if (syncInterval !== null) {
			clearInterval(syncInterval);
			syncInterval = null;
		}
		// 不清理全局定时器，保持会话持久化
	});

</script>

<a href="/timetable/" class="block">
	<div
		class="ring-foreground/10 bg-card text-card-foreground overflow-hidden rounded-2xl text-sm ring-1 p-3 space-y-0.5"
	>
		{#each statusLines as line}
			<p class="text-xs leading-relaxed">
				{#each line as segment}
					{#if segment.text.startsWith('###')}
						<span
							class="text-sm font-bold transition-colors"
							style="color: {segment.color || 'inherit'}"
						>
							{segment.text.replace('###', '').trim()}
						</span>
					{:else}
						<span
							class="transition-colors"
							class:font-bold={segment.bold}
							class:line-through={segment.strikethrough}
							class:opacity-60={segment.strikethrough}
							style="color: {segment.color || 'inherit'}"
						>
							{segment.text}
						</span>
					{/if}
				{/each}
			</p>
		{/each}
	</div>
</a>
