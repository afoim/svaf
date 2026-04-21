<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Alert from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import type {
		ParsedTimetableData,
		TimetableCourseArrangement,
		TimetableViewModel
	} from '$lib/types/timetable';
	import { buildTimetableViewModel } from '$lib/utils/timetable-normalizer';
	import {
		parseTimetableText,
		serializeTimetableDataToFileText
	} from '$lib/utils/timetable-parser';

	let { viewModel, baselineText }: { viewModel: TimetableViewModel; baselineText: string } =
		$props();

	const dayLabels: Record<number, string> = {
		1: '周一',
		2: '周二',
		3: '周三',
		4: '周四',
		5: '周五',
		6: '周六',
		7: '周日'
	};

	let editMode = $state(false);
	let baselineParsed = $state(parseTimetableText(baselineText));
	let draftParsed = $state(cloneParsedData(baselineParsed));
	let previewViewModel = $state(buildTimetableViewModel(draftParsed, viewModel.currentWeek));
	let selectedArrangementRef = $state<number | null>(null);
	let validationError = $state('');
	let isDirty = $state(false);
	let creatingCourse = $state(false);

	let visibleDays = $derived(viewModel.dayColumns.map((column) => column.day));
	let maxNode = $derived(Math.max(...viewModel.nodeRows.map((row) => row.node), 1));
	let selectedArrangement = $derived(
		selectedArrangementRef === null ? null : draftParsed.arrangements[selectedArrangementRef] ?? null
	);
	let selectedCourseName = $derived(
		selectedArrangement
			? draftParsed.courseDefinitions.find((course) => course.id === selectedArrangement?.id)
					?.courseName || ''
			: ''
	);

	type NewCourseDraft = {
		courseName: string;
		teacher: string;
		room: string;
		day: number;
		startNode: number;
		startWeek: number;
		endWeek: number;
	};

	let newCourseDraft = $state<NewCourseDraft>(createNewCourseDraft());
	let newCourseDaySelected = $state<{ value: number; label: string } | undefined>(undefined);
	let selectedArrangementDaySelected = $state<{ value: number; label: string } | undefined>(
		undefined
	);

	$effect(() => {
		newCourseDaySelected = {
			value: newCourseDraft.day,
			label: dayLabels[newCourseDraft.day]
		};
	});

	$effect(() => {
		if (selectedArrangement) {
			selectedArrangementDaySelected = {
				value: selectedArrangement.day,
				label: dayLabels[selectedArrangement.day]
			};
		}
	});

	function cloneParsedData(data: ParsedTimetableData): ParsedTimetableData {
		return JSON.parse(JSON.stringify(data));
	}

	function createNewCourseDraft(): NewCourseDraft {
		const defaultDay = visibleDays[0] ?? 1;
		const maxWeek = Math.max(1, draftParsed.meta.maxWeek || 1);
		return {
			courseName: '',
			teacher: '',
			room: '',
			day: defaultDay,
			startNode: 1,
			startWeek: 1,
			endWeek: maxWeek
		};
	}

	function enterEditMode() {
		draftParsed = cloneParsedData(baselineParsed);
		previewViewModel = buildTimetableViewModel(draftParsed, viewModel.currentWeek);
		selectedArrangementRef = null;
		creatingCourse = false;
		newCourseDraft = createNewCourseDraft();
		validationError = '';
		isDirty = false;
		editMode = true;
	}

	function cancelEditMode() {
		editMode = false;
		draftParsed = cloneParsedData(baselineParsed);
		previewViewModel = buildTimetableViewModel(draftParsed, viewModel.currentWeek);
		selectedArrangementRef = null;
		creatingCourse = false;
		validationError = '';
		isDirty = false;
	}

	function resetDraft() {
		draftParsed = cloneParsedData(baselineParsed);
		previewViewModel = buildTimetableViewModel(draftParsed, viewModel.currentWeek);
		selectedArrangementRef = null;
		creatingCourse = false;
		newCourseDraft = createNewCourseDraft();
		validationError = '';
		isDirty = false;
	}

	function beginCreateCourse() {
		creatingCourse = true;
		selectedArrangementRef = null;
		validationError = '';
		newCourseDraft = createNewCourseDraft();
	}

	function cancelCreateCourse() {
		creatingCourse = false;
		newCourseDraft = createNewCourseDraft();
		validationError = '';
	}

	function submitCreateCourse() {
		const courseName = newCourseDraft.courseName.trim();
		if (!courseName) {
			validationError = '课程名不能为空';
			return;
		}

		const maxWeek = Math.max(1, draftParsed.meta.maxWeek || 1);
		if (!visibleDays.includes(newCourseDraft.day)) {
			validationError = '星期不在当前课表显示范围内';
			return;
		}
		if (newCourseDraft.startNode < 1 || newCourseDraft.startNode > maxNode) {
			validationError = `起始节次超出范围（1-${maxNode}）`;
			return;
		}
		if (newCourseDraft.startWeek < 1 || newCourseDraft.endWeek < 1) {
			validationError = '周次必须大于等于 1';
			return;
		}
		if (newCourseDraft.startWeek > newCourseDraft.endWeek) {
			validationError = '开始周不能大于结束周';
			return;
		}
		if (newCourseDraft.endWeek > maxWeek) {
			validationError = `结束周超出最大周次 ${maxWeek}`;
			return;
		}

		const maxCourseId = draftParsed.courseDefinitions.reduce(
			(maxId, course) => Math.max(maxId, course.id),
			0
		);
		const nextCourseId = maxCourseId + 1;
		draftParsed.courseDefinitions.push({
			id: nextCourseId,
			courseName
		});
		draftParsed.arrangements.push({
			id: nextCourseId,
			day: newCourseDraft.day,
			startNode: newCourseDraft.startNode,
			step: 2,
			startWeek: newCourseDraft.startWeek,
			endWeek: newCourseDraft.endWeek,
			teacher: newCourseDraft.teacher,
			room: newCourseDraft.room
		});

		creatingCourse = false;
		selectedArrangementRef = draftParsed.arrangements.length - 1;
		validationError = '';
		afterDraftChange();
		newCourseDraft = createNewCourseDraft();
	}

	function updateSelectedArrangement(
		field: 'teacher' | 'room' | 'day' | 'startNode' | 'startWeek' | 'endWeek',
		value: string | number
	) {
		if (selectedArrangementRef === null) return;
		const arrangement = draftParsed.arrangements[selectedArrangementRef];
		if (!arrangement) return;

		if (field === 'teacher' || field === 'room') {
			arrangement[field] = String(value);
		} else {
			const numValue = typeof value === 'number' ? value : Number(value);
			if (!Number.isFinite(numValue)) return;
			(arrangement as any)[field] = Math.floor(numValue);
		}

		afterDraftChange();
	}

	function updateCourseName(value: string) {
		if (!selectedArrangement) return;
		const courseDef = draftParsed.courseDefinitions.find(
			(course) => course.id === selectedArrangement?.id
		);
		if (!courseDef) return;
		courseDef.courseName = value;
		afterDraftChange();
	}

	function deleteSelectedArrangement() {
		if (selectedArrangementRef === null) return;
		draftParsed.arrangements.splice(selectedArrangementRef, 1);
		selectedArrangementRef = null;
		afterDraftChange();
	}

	function afterDraftChange() {
		validationError = '';
		previewViewModel = buildTimetableViewModel(draftParsed, viewModel.currentWeek);
		isDirty = true;
	}

	function exportJson() {
		const text = serializeTimetableDataToFileText(draftParsed);
		const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${baselineParsed.meta.tableName || 'timetable'}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		cancelEditMode();
	}

	function selectArrangement(index: number) {
		creatingCourse = false;
		selectedArrangementRef = index;
		validationError = '';
	}

	let arrangementCards = $derived.by(() => {
		return previewViewModel.dayColumns.map((dayColumn) => {
			const cards = previewViewModel.coursesByDay[dayColumn.day] ?? [];
			const items = cards
				.map((courseView) => {
					const arrangementIndex = draftParsed.arrangements.findIndex(
						(arrangement) =>
							arrangement.id === courseView.courseId &&
							arrangement.day === courseView.day &&
							arrangement.startNode === courseView.startNode &&
							arrangement.startWeek === courseView.startWeek &&
							arrangement.endWeek === courseView.endWeek
					);

					if (arrangementIndex < 0) return null;

					return {
						arrangementIndex,
						title: courseView.courseName,
						teacher: courseView.teacher,
						room: courseView.room,
						nodeText: courseView.nodeText,
						weekText: `${courseView.startWeek}-${courseView.endWeek}周`,
						color: courseView.color
					};
				})
				.filter((item): item is NonNullable<typeof item> => Boolean(item));

			return {
				day: dayColumn.day,
				label: dayLabels[dayColumn.day] ?? dayColumn.label,
				items
			};
		});
	});
</script>

<div class="mb-6 flex flex-wrap items-center gap-3">
	{#if editMode}
		<Button variant="outline" onclick={cancelEditMode}>
			<Icon icon="mdi:close" class="mr-2 h-4 w-4" />
			退出编辑
		</Button>
		<Button variant="outline" onclick={resetDraft} disabled={!isDirty}>
			<Icon icon="mdi:refresh" class="mr-2 h-4 w-4" />
			重置
		</Button>
		<Button onclick={beginCreateCourse}>
			<Icon icon="mdi:plus" class="mr-2 h-4 w-4" />
			新增课程
		</Button>
		<Button onclick={exportJson}>
			<Icon icon="mdi:download" class="mr-2 h-4 w-4" />
			导出 JSON
		</Button>
	{:else}
		<Button onclick={enterEditMode}>
			<Icon icon="mdi:pencil" class="mr-2 h-4 w-4" />
			编辑课表
		</Button>
	{/if}
</div>

{#if editMode}
	<Alert.Root class="mb-4">
		<Icon icon="mdi:information" class="h-4 w-4" />
		<Alert.Title>编辑模式</Alert.Title>
		<Alert.Description>
			当前为临时编辑模式，导出后将自动退出并恢复原始课表展示。
		</Alert.Description>
	</Alert.Root>

	{#if validationError}
		<Alert.Root variant="destructive" class="mb-4">
			<Icon icon="mdi:alert-circle" class="h-4 w-4" />
			<Alert.Title>错误</Alert.Title>
			<Alert.Description>{validationError}</Alert.Description>
		</Alert.Root>
	{/if}

	<div class="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
		<!-- 左侧：课程列表 -->
		<Card>
			<CardHeader>
				<CardTitle>可视化课程列表（第 {viewModel.currentWeek} 周）</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid gap-4 md:grid-cols-2">
					{#each arrangementCards as dayGroup}
						<div class="space-y-2">
							<h4 class="font-semibold">{dayGroup.label}</h4>
							{#if dayGroup.items.length === 0}
								<p class="text-sm text-muted-foreground">本日暂无课程</p>
							{:else}
								<div class="space-y-2">
									{#each dayGroup.items as item}
										<button
											type="button"
											class="w-full rounded-lg border p-3 text-left transition-colors {selectedArrangementRef ===
											item.arrangementIndex
												? 'border-primary bg-primary/10'
												: 'border-border hover:border-primary/50'}"
											onclick={() => selectArrangement(item.arrangementIndex)}
										>
											<div class="font-semibold" style="color: {item.color}">{item.title}</div>
											<div class="text-xs text-muted-foreground">
												{item.nodeText} · {item.weekText}
											</div>
											<div class="text-xs text-muted-foreground">{item.teacher} / {item.room}</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</CardContent>
		</Card>

		<!-- 右侧：编辑面板 -->
		<Card>
			<CardHeader>
				<CardTitle>属性编辑</CardTitle>
			</CardHeader>
			<CardContent>
				{#if creatingCourse}
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="new-course-name">课程名</Label>
							<Input
								id="new-course-name"
								bind:value={newCourseDraft.courseName}
								placeholder="输入课程名"
							/>
						</div>

						<div class="space-y-2">
							<Label for="new-teacher">教师</Label>
							<Input id="new-teacher" bind:value={newCourseDraft.teacher} placeholder="输入教师" />
						</div>

						<div class="space-y-2">
							<Label for="new-room">教室</Label>
							<Input id="new-room" bind:value={newCourseDraft.room} placeholder="输入教室" />
						</div>

						<div class="space-y-2">
							<Label for="new-day">星期</Label>
							<Select.Root
								selected={newCourseDaySelected}
								onSelectedChange={(v) => {
									if (v) {
										newCourseDraft.day = v.value;
										newCourseDaySelected = v;
									}
								}}
							>
								<Select.Trigger id="new-day">
									<Select.Value placeholder="选择星期" />
								</Select.Trigger>
								<Select.Content>
									{#each visibleDays as day}
										<Select.Item value={day}>{dayLabels[day]}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="space-y-2">
							<Label for="new-start-node">起始节</Label>
							<Input
								id="new-start-node"
								type="number"
								min="1"
								max={maxNode}
								bind:value={newCourseDraft.startNode}
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="new-start-week">起始周</Label>
								<Input
									id="new-start-week"
									type="number"
									min="1"
									max={draftParsed.meta.maxWeek}
									bind:value={newCourseDraft.startWeek}
								/>
							</div>

							<div class="space-y-2">
								<Label for="new-end-week">结束周</Label>
								<Input
									id="new-end-week"
									type="number"
									min="1"
									max={draftParsed.meta.maxWeek}
									bind:value={newCourseDraft.endWeek}
								/>
							</div>
						</div>

						<div class="flex gap-2">
							<Button onclick={submitCreateCourse}>保存新增课程</Button>
							<Button variant="outline" onclick={cancelCreateCourse}>取消</Button>
						</div>
					</div>
				{:else if selectedArrangement}
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="course-name">课程名</Label>
							<Input
								id="course-name"
								value={selectedCourseName}
								oninput={(e) => updateCourseName(e.currentTarget.value)}
							/>
						</div>

						<div class="space-y-2">
							<Label for="teacher">教师</Label>
							<Input
								id="teacher"
								value={selectedArrangement.teacher ?? ''}
								oninput={(e) => updateSelectedArrangement('teacher', e.currentTarget.value)}
							/>
						</div>

						<div class="space-y-2">
							<Label for="room">教室</Label>
							<Input
								id="room"
								value={selectedArrangement.room ?? ''}
								oninput={(e) => updateSelectedArrangement('room', e.currentTarget.value)}
							/>
						</div>

						<div class="space-y-2">
							<Label for="day">星期</Label>
							<Select.Root
								selected={selectedArrangementDaySelected}
								onSelectedChange={(v) => {
									if (v) {
										updateSelectedArrangement('day', v.value);
										selectedArrangementDaySelected = v;
									}
								}}
							>
								<Select.Trigger id="day">
									<Select.Value />
								</Select.Trigger>
								<Select.Content>
									{#each visibleDays as day}
										<Select.Item value={day}>{dayLabels[day]}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="space-y-2">
							<Label for="start-node">起始节</Label>
							<Input
								id="start-node"
								type="number"
								min="1"
								max={maxNode}
								value={selectedArrangement.startNode}
								oninput={(e) =>
									updateSelectedArrangement('startNode', Number(e.currentTarget.value))}
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="start-week">起始周</Label>
								<Input
									id="start-week"
									type="number"
									min="1"
									max={draftParsed.meta.maxWeek}
									value={selectedArrangement.startWeek}
									oninput={(e) =>
										updateSelectedArrangement('startWeek', Number(e.currentTarget.value))}
								/>
							</div>

							<div class="space-y-2">
								<Label for="end-week">结束周</Label>
								<Input
									id="end-week"
									type="number"
									min="1"
									max={draftParsed.meta.maxWeek}
									value={selectedArrangement.endWeek}
									oninput={(e) =>
										updateSelectedArrangement('endWeek', Number(e.currentTarget.value))}
								/>
							</div>
						</div>

						<Button variant="destructive" onclick={deleteSelectedArrangement}>
							<Icon icon="mdi:delete" class="mr-2 h-4 w-4" />
							删除课程
						</Button>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">
						请先在左侧点击课程卡片，或点击上方"新增课程"。
					</p>
				{/if}
			</CardContent>
		</Card>
	</div>
{:else}
	<Alert.Root class="mb-4">
		<Icon icon="mdi:information" class="h-4 w-4" />
		<Alert.Description>
			点击"编辑课表"进入图形化编辑模式，导出后会自动还原页面临时修改。
		</Alert.Description>
	</Alert.Root>
{/if}
