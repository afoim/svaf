<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Alert from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import type {
		ParsedTimetableData,
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
	let validationError = $state('');
	let isDirty = $state(false);

	type CourseArrangementItem = {
		index: number;
		courseName: string;
		teacher: string;
		room: string;
		day: number;
		startNode: number;
		startWeek: number;
		endWeek: number;
	};

	let arrangements = $derived.by(() => {
		return draftParsed.arrangements.map((arr, index) => {
			const courseDef = draftParsed.courseDefinitions.find((c) => c.id === arr.id);
			return {
				index,
				courseName: courseDef?.courseName || '',
				teacher: arr.teacher || '',
				room: arr.room || '',
				day: arr.day,
				startNode: arr.startNode,
				startWeek: arr.startWeek,
				endWeek: arr.endWeek
			};
		});
	});

	function cloneParsedData(data: ParsedTimetableData): ParsedTimetableData {
		return JSON.parse(JSON.stringify(data));
	}

	function enterEditMode() {
		draftParsed = cloneParsedData(baselineParsed);
		previewViewModel = buildTimetableViewModel(draftParsed, viewModel.currentWeek);
		validationError = '';
		isDirty = false;
		editMode = true;
	}

	function cancelEditMode() {
		editMode = false;
		draftParsed = cloneParsedData(baselineParsed);
		previewViewModel = buildTimetableViewModel(draftParsed, viewModel.currentWeek);
		validationError = '';
		isDirty = false;
	}

	function resetDraft() {
		draftParsed = cloneParsedData(baselineParsed);
		previewViewModel = buildTimetableViewModel(draftParsed, viewModel.currentWeek);
		validationError = '';
		isDirty = false;
	}

	function addNewCourse() {
		const maxCourseId = draftParsed.courseDefinitions.reduce(
			(maxId, course) => Math.max(maxId, course.id),
			0
		);
		const nextCourseId = maxCourseId + 1;
		
		draftParsed.courseDefinitions.push({
			id: nextCourseId,
			courseName: '新课程'
		});
		
		draftParsed.arrangements.push({
			id: nextCourseId,
			day: 1,
			startNode: 1,
			step: 2,
			startWeek: 1,
			endWeek: draftParsed.meta.maxWeek,
			teacher: '',
			room: ''
		});

		afterDraftChange();
	}

	function updateArrangement(index: number, field: string, value: string | number) {
		const arrangement = draftParsed.arrangements[index];
		if (!arrangement) return;

		if (field === 'courseName') {
			const courseDef = draftParsed.courseDefinitions.find((c) => c.id === arrangement.id);
			if (courseDef) {
				courseDef.courseName = String(value);
			}
		} else if (field === 'teacher' || field === 'room') {
			arrangement[field] = String(value);
		} else {
			const numValue = typeof value === 'number' ? value : Number(value);
			if (!Number.isFinite(numValue)) return;
			(arrangement as any)[field] = Math.floor(numValue);
		}

		afterDraftChange();
	}

	function deleteArrangement(index: number) {
		draftParsed.arrangements.splice(index, 1);
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
		<Button onclick={addNewCourse}>
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

	<Card>
		<CardHeader>
			<CardTitle>课程列表（共 {arrangements.length} 门）</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="space-y-4">
				{#each arrangements as item (item.index)}
					<div class="rounded-lg border p-4">
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<div class="space-y-2">
								<Label>课程名</Label>
								<Input
									value={item.courseName}
									oninput={(e) => updateArrangement(item.index, 'courseName', e.currentTarget.value)}
									placeholder="课程名"
								/>
							</div>

							<div class="space-y-2">
								<Label>教师</Label>
								<Input
									value={item.teacher}
									oninput={(e) => updateArrangement(item.index, 'teacher', e.currentTarget.value)}
									placeholder="教师"
								/>
							</div>

							<div class="space-y-2">
								<Label>教室</Label>
								<Input
									value={item.room}
									oninput={(e) => updateArrangement(item.index, 'room', e.currentTarget.value)}
									placeholder="教室"
								/>
							</div>

							<div class="space-y-2">
								<Label>星期</Label>
								<Input
									type="number"
									min="1"
									max="7"
									value={item.day}
									oninput={(e) => updateArrangement(item.index, 'day', Number(e.currentTarget.value))}
								/>
								<p class="text-xs text-muted-foreground">{dayLabels[item.day] || '无效'}</p>
							</div>

							<div class="space-y-2">
								<Label>起始节</Label>
								<Input
									type="number"
									min="1"
									value={item.startNode}
									oninput={(e) =>
										updateArrangement(item.index, 'startNode', Number(e.currentTarget.value))}
								/>
							</div>

							<div class="space-y-2">
								<Label>起始周</Label>
								<Input
									type="number"
									min="1"
									max={draftParsed.meta.maxWeek}
									value={item.startWeek}
									oninput={(e) =>
										updateArrangement(item.index, 'startWeek', Number(e.currentTarget.value))}
								/>
							</div>

							<div class="space-y-2">
								<Label>结束周</Label>
								<Input
									type="number"
									min="1"
									max={draftParsed.meta.maxWeek}
									value={item.endWeek}
									oninput={(e) =>
										updateArrangement(item.index, 'endWeek', Number(e.currentTarget.value))}
								/>
							</div>

							<div class="flex items-end">
								<Button
									variant="destructive"
									size="sm"
									onclick={() => deleteArrangement(item.index)}
									class="w-full"
								>
									<Icon icon="mdi:delete" class="mr-2 h-4 w-4" />
									删除
								</Button>
							</div>
						</div>
					</div>
				{/each}

				{#if arrangements.length === 0}
					<p class="text-center text-muted-foreground py-8">暂无课程，点击"新增课程"开始添加</p>
				{/if}
			</div>
		</CardContent>
	</Card>
{:else}
	<Alert.Root class="mb-4">
		<Icon icon="mdi:information" class="h-4 w-4" />
		<Alert.Description>
			点击"编辑课表"进入图形化编辑模式，导出后会自动还原页面临时修改。
		</Alert.Description>
	</Alert.Root>
{/if}
