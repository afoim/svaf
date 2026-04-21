<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Pagination from '$lib/components/ui/pagination';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	interface Friend {
		name: string;
		avatar: string;
		description: string;
		url: string;
	}

	let friends = $state<Friend[]>([]);
	let currentPage = $state(1);
	const itemsPerPage = 12;

	let totalPages = $derived(Math.ceil(friends.length / itemsPerPage));
	let paginatedFriends = $derived(
		friends.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	onMount(async () => {
		try {
			const response = await fetch('/api/friends');
			if (response.ok) {
				friends = await response.json();
			}
		} catch (error) {
			console.error('Failed to load friends:', error);
		}
	});
</script>

<svelte:head>
	<title>友链 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-12">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold">友情链接</h1>
		<p class="text-lg text-muted-foreground">
			这里是我的朋友们，欢迎互相访问交流
		</p>
	</div>

	<div class="mb-8">
		<Card>
			<CardHeader>
				<CardTitle>申请友链</CardTitle>
				<CardDescription>欢迎与我交换友链，请在评论区留言或通过其他方式联系我</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="space-y-2 text-sm text-muted-foreground">
					<p>• 网站名称：二叉树树</p>
					<p>• 网站地址：https://2x.nz</p>
					<p>• 网站描述：Protect What You Love.</p>
					<p>• 网站头像：https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=0</p>
				</div>
			</CardContent>
		</Card>
	</div>

	<div>
		<h2 class="mb-6 text-2xl font-bold">友链列表 ({friends.length})</h2>
		{#if friends.length === 0}
			<Card>
				<CardContent class="py-12 text-center text-muted-foreground">
					暂无友链
				</CardContent>
			</Card>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each paginatedFriends as friend (friend.url)}
					<a href={friend.url} target="_blank" rel="noopener noreferrer">
						<Card class="h-full transition-all hover:shadow-lg">
							<CardContent class="flex items-start gap-4 p-6">
								<img
									src={friend.avatar}
									alt={friend.name}
									class="h-16 w-16 rounded-full"
								/>
								<div class="flex-1 overflow-hidden">
									<div class="mb-1 truncate font-semibold">{friend.name}</div>
									<div class="line-clamp-2 text-sm text-muted-foreground">
										{friend.description}
									</div>
								</div>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>

			{#if totalPages > 1}
				<div class="mt-8 flex justify-center">
					<Pagination.Root count={friends.length} perPage={itemsPerPage} bind:page={currentPage}>
						{#snippet children({ pages })}
							<Pagination.Content>
								<Pagination.Item>
									<Pagination.PrevButton>
										{#snippet children()}
											<Icon icon="mdi:chevron-left" class="w-4 h-4" />
											<span>上一页</span>
										{/snippet}
									</Pagination.PrevButton>
								</Pagination.Item>

								{#each pages as page (page.key)}
									{#if page.type === 'ellipsis'}
										<Pagination.Item>
											<Pagination.Ellipsis />
										</Pagination.Item>
									{:else}
										<Pagination.Item>
											<Pagination.Link {page} isActive={currentPage === page.value}>
												{page.value}
											</Pagination.Link>
										</Pagination.Item>
									{/if}
								{/each}

								<Pagination.Item>
									<Pagination.NextButton>
										{#snippet children()}
											<span>下一页</span>
											<Icon icon="mdi:chevron-right" class="w-4 h-4" />
										{/snippet}
									</Pagination.NextButton>
								</Pagination.Item>
							</Pagination.Content>
						{/snippet}
					</Pagination.Root>
				</div>
			{/if}
		{/if}
	</div>

	<div class="mt-8 text-center">
		<a href="/">
			<Button variant="outline">
				<Icon icon="mdi:home" class="mr-2 h-4 w-4" />
				返回首页
			</Button>
		</a>
	</div>
</div>
