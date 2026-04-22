<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import PageViews from '$lib/components/PageViews.svelte';
	import FileExplorer from './FileExplorer.svelte';
	import OneDriveExplorer from './OneDriveExplorer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>文件 - 二叉树树</title>
	<meta name="description" content="下载公开文件资源" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:folder-open" class="size-6 text-primary" />
					文件索引
				</CardTitle>
				<PageViews pathname="/files/" class="text-sm text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-1 text-sm text-muted-foreground">
				<p>这里展示了本站托管的各项公开资源，你可以点击查看并下载。</p>
				<Alert variant="destructive">
					<Icon icon="mdi:alert-outline" />
					<AlertDescription>
						免责声明：本站不对任何文件的安全性做保证，请在下载或运行前自行核实，风险自担。
					</AlertDescription>
				</Alert>
			</div>

			<Tabs value="local">
				<TabsList>
					<TabsTrigger value="local">
						<Icon icon="mdi:home-variant" class="size-4" />
						本站
					</TabsTrigger>
					<TabsTrigger value="onedrive">
						<Icon icon="mdi:microsoft-onedrive" class="size-4" />
						OneDrive
					</TabsTrigger>
				</TabsList>

				<TabsContent value="local">
					<FileExplorer items={data.fileTree} />
				</TabsContent>

				<TabsContent value="onedrive">
					<OneDriveExplorer />
				</TabsContent>
			</Tabs>
		</CardContent>
	</Card>
</div>
