<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Icon from '@iconify/svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	const { viewModel, isCurrentWeek } = data;
</script>

<svelte:head>
	<title>课程表 - 第 {viewModel.currentWeek} 周 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-12">
	<div class="mb-8">
		<div class="mb-4 flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold mb-2">{viewModel.tableName}</h1>
				<p class="text-muted-foreground">共 {viewModel.maxWeek} 周</p>
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
				<a href={`/timetable/${Math.max(1, viewModel.currentWeek - 1)}/`}>
					<Button variant="outline" size="icon" disabled={viewModel.currentWeek <= 1}>
						<Icon icon="mdi:chevron-left" class="h-5 w-5" />
					</Button>
				</a>
				<span class="min-w-[4.5rem] px-3 text-center font-medium">
					第 {viewModel.currentWeek} 周
				</span>
				<a href={`/timetable/${Math.min(viewModel.maxWeek, viewModel.currentWeek + 1)}/`}>
					<Button variant="outline" size="icon" disabled={viewModel.currentWeek >= viewModel.maxWeek}>
						<Icon icon="mdi:chevron-right" class="h-5 w-5" />
					</Button>
				</a>
				{#if isCurrentWeek}
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
					<table class="w-full">
						<thead>
							<tr class="border-b">
								<th class="px-4 py-3 text-left text-sm font-semibold">节次</th>
								{#each viewModel.dayColumns as day}
									<th class="px-4 py-3 text-left text-sm font-semibold">{day.label}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each viewModel.nodeRows.filter((row) => row.node % 2 === 1) as row}
								<tr class="border-b last:border-b-0">
									<td class="px-4 py-3 align-top">
										<p class="text-sm font-medium">第 {row.node}-{Math.min(row.node + 1, viewModel.nodeRows.length)} 节</p>
										<p class="text-xs text-muted-foreground mt-1">
											{row.startTime} - {viewModel.nodeRows.find((item) => item.node === Math.min(row.node + 1, viewModel.nodeRows.length))?.endTime ?? row.endTime}
										</p>
									</td>
									{#each viewModel.dayColumns as day}
										{@const courses = (viewModel.coursesByDay[day.day] ?? []).filter(c => c.startNode === row.node)}
										<td class="px-4 py-3 align-top min-w-[180px]">
											{#if courses.length > 0}
												<div class="space-y-2">
													{#each courses as course}
														<div
															class="rounded-lg border-l-4 p-3 text-sm"
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
		{#each viewModel.dayColumns as day}
			{@const courses = viewModel.coursesByDay[day.day] ?? []}
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
