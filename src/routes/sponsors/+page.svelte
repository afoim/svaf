<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import Icon from '@iconify/svelte';
	import { staticData } from '$lib/data/static-data';

	interface Sponsor {
		name: string;
		avatar: string | null;
		date: string;
		amount: string;
	}

	let sponsors = $state<Sponsor[]>(staticData.sponsors);
</script>

<svelte:head>
	<title>赞助 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold">赞助支持</h1>
		<p class="text-lg text-muted-foreground">
			感谢您的支持，您的赞助将帮助我持续创作优质内容
		</p>
	</div>

	<div class="mb-12">
		<Card>
			<CardHeader>
				<CardTitle>扫码赞助</CardTitle>
				<CardDescription>选择您喜欢的支付方式</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value="wechat" class="w-full">
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="wechat">
							<Icon icon="simple-icons:wechat" class="mr-2 h-4 w-4" />
							微信支付
						</TabsTrigger>
						<TabsTrigger value="alipay">
							<Icon icon="simple-icons:alipay" class="mr-2 h-4 w-4" />
							支付宝
						</TabsTrigger>
					</TabsList>
					<TabsContent value="wechat" class="flex justify-center py-6">
						<img src="/sponsors/qrcode/wechat.svg" alt="微信支付二维码" class="h-64 w-64" />
					</TabsContent>
					<TabsContent value="alipay" class="flex justify-center py-6">
						<img src="/sponsors/qrcode/alipay.svg" alt="支付宝二维码" class="h-64 w-64" />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	</div>

	<div>
		<h2 class="mb-6 text-2xl font-bold">赞助名单</h2>
		{#if sponsors.length === 0}
			<Card>
				<CardContent class="py-12 text-center text-muted-foreground">
					暂无赞助记录
				</CardContent>
			</Card>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each sponsors as sponsor}
					<Card>
						<CardContent class="flex items-center gap-4 p-6">
							{#if sponsor.avatar}
								<img
									src={sponsor.avatar}
									alt={sponsor.name}
									class="h-12 w-12 rounded-full"
								/>
							{:else}
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
									{sponsor.name.charAt(0)}
								</div>
							{/if}
							<div class="flex-1">
								<div class="font-semibold">{sponsor.name}</div>
								<div class="text-sm text-muted-foreground">{sponsor.date}</div>
							</div>
							<div class="text-sm font-medium text-primary">{sponsor.amount}</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
</div>
