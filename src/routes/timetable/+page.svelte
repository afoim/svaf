<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import PageViews from '$lib/components/PageViews.svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();

	function buildWeekHref(week: number) {
		return `/timetable/?week=${week}`;
	}

	function goToPreviousWeek() {
		const targetWeek = data.viewModel.currentWeek - 1;
		if (data.viewModel.currentWeek > 1) {
			goto(buildWeekHref(targetWeek));
		}
	}

	function goToNextWeek() {
		const targetWeek = data.viewModel.currentWeek + 1;
		if (data.viewModel.currentWeek < data.viewModel.maxWeek) {
			goto(buildWeekHref(targetWeek));
		}
	}
</script>

<svelte:head>
	<title>课程表 - 第 {data.viewModel.currentWeek} 周 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-12">
	<div class="mb-8">
		<div class="mb-4 flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold mb-2">{data.viewModel.tableName}</h1>
				<div class="flex items-center gap-2 text-muted-foreground">
					<p>共 {data.viewModel.maxWeek} 周</p>
					<span>·</span>
					<PageViews pathname="/timetable/" class="text-sm" />
				</div>
			</div>
			<a href="/">
				<Button variant="outline">
					<Icon icon="mdi:home" class="mr-2 h-4 w-4" />
					返回首页
				</Button>
			</a>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<div class="inline-flex items-center gap-1">
				<Button 
					variant="outline" 
					size="icon" 
					disabled={data.viewModel.currentWeek <= 1}
					onclick={goToPreviousWeek}
				>
					<Icon icon="mdi:chevron-left" class="h-5 w-5" />
				</Button>
				<span class="min-w-[4.5rem] px-3 text-center font-medium">
					第 {data.viewModel.currentWeek} 周
				</span>
				<Button 
					variant="outline" 
					size="icon" 
					disabled={data.viewModel.currentWeek >= data.viewModel.maxWeek}
					onclick={goToNextWeek}
				>
					<Icon icon="mdi:chevron-right" class="h-5 w-5" />
				</Button>
				{#if data.isCurrentWeek}
					<Badge variant="default" class="ml-2">当前周</Badge>
				{/if}
			</div>
		</div>
	</div>

	<!-- 桌面端网格视图 -->
	<div class="hidden md:block mb-8">
		<Card>
			<CardContent class="p-0">
				<div class="overflow-x-auto">
					<table class="w-full table-fixed">
						<colgroup>
							<col class="w-28" />
							{#each data.viewModel.dayColumns as _day}
								<col />
							{/each}
						</colgroup>
						<thead>
							<tr class="border-b">
								<th class="px-4 py-3 text-left text-sm font-semibold">节次</th>
								{#each data.viewModel.dayColumns as day}
									<th class="px-4 py-3 text-left text-sm font-semibold">{day.label}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each data.viewModel.nodeRows.filter((row) => row.node % 2 === 1) as row}
								<tr class="border-b last:border-b-0">
									<td class="px-4 py-3 align-top">
										<p class="text-sm font-medium">第 {row.node}-{Math.min(row.node + 1, data.viewModel.nodeRows.length)} 节</p>
										<p class="text-xs text-muted-foreground mt-1">
											{row.startTime} - {data.viewModel.nodeRows.find((item) => item.node === Math.min(row.node + 1, data.viewModel.nodeRows.length))?.endTime ?? row.endTime}
										</p>
									</td>
									{#each data.viewModel.dayColumns as day}
										{@const courses = (data.viewModel.coursesByDay[day.day] ?? []).filter(c => c.startNode === row.node)}
										<td class="px-4 py-3 align-top">
											{#if courses.length > 0}
												<div class="space-y-2">
													{#each courses as course}
														<div
															class="rounded-lg border-l-4 p-3 text-sm break-words"
															style="border-color: {course.color}; background: color-mix(in srgb, {course.color} 10%, transparent)"
														>
															<div class="font-semibold mb-1">{course.courseName}</div>
															<div class="text-xs text-muted-foreground space-y-0.5">
																<div>{course.startWeek}-{course.endWeek}周</div>
																<div>教室：{course.room}</div>
																<div>教师：{course.teacher}</div>
															</div>
														</div>
													{/each}
												</div>
											{:else}
												<div class="text-center text-xs text-muted-foreground">—</div>
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- 移动端列表视图 -->
	<div class="md:hidden space-y-4">
		{#each data.viewModel.dayColumns as day}
			{@const courses = data.viewModel.coursesByDay[day.day] ?? []}
			<Card>
				<CardHeader>
					<CardTitle class="text-lg">{day.label}</CardTitle>
				</CardHeader>
				<CardContent>
					{#if courses.length > 0}
						<div class="space-y-3">
							{#each courses as course}
								<div
									class="rounded-lg border-l-4 p-3"
									style="border-color: {course.color}; background: color-mix(in srgb, {course.color} 10%, transparent)"
								>
									<div class="font-semibold mb-2">{course.courseName}</div>
									<div class="text-sm text-muted-foreground space-y-1">
										<div>时间：{course.timeText}</div>
										<div>周次：{course.startWeek}-{course.endWeek}周</div>
										<div>教室：{course.room}</div>
										<div>教师：{course.teacher}</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">本周暂无课程</p>
					{/if}
				</CardContent>
			</Card>
		{/each}
	</div>
</div>
