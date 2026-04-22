<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import ForumMarkdownEditor from '$lib/components/forum/ForumMarkdownEditor.svelte';
	import { createPost } from '$lib/forum/api/posts';
	import { getCategories } from '$lib/forum/api/categories';
	import { getSession } from '$lib/forum/api/auth';
	import { forumAuth } from '$lib/forum/stores/auth';
	import type { ForumCategory } from '$lib/forum/types/post';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';

	let title = $state('');
	let content = $state('');
	let categoryId = $state('');
	let submitting = $state(false);
	let categories = $state<ForumCategory[]>([]);
	let categoriesLoading = $state(true);

	async function loadCategories() {
		categoriesLoading = true;
		try {
			categories = await getCategories();
		} catch (e) {
			console.error(e);
			categories = [];
		} finally {
			categoriesLoading = false;
		}
	}

	async function hydrateSession() {
		if (!forumAuth.getToken()) return;
		try {
			const session = await getSession();
			forumAuth.setSession(session);
		} catch {
			// 静默
		}
	}

	async function submit() {
		if (submitting) return;
		const t = title.trim();
		const c = content.trim();
		if (!t) {
			emitErrorToast('发帖', '请填写标题。');
			return;
		}
		if (!c) {
			emitErrorToast('发帖', '请填写内容。');
			return;
		}
		if (!forumAuth.getToken()) {
			emitErrorToast('发帖', '请先登录后再发布帖子。');
			return;
		}
		submitting = true;
		try {
			const result = await createPost({
				title: t,
				content: c,
				categoryId: categoryId || undefined
			});
			const nextId = String(result.id || '').trim();
			if (!nextId) throw new Error('发帖成功，但未拿到帖子 ID。');
			emitSuccessToast('发帖', '发布成功，正在跳转...');
			void goto(`/forum/post/?id=${encodeURIComponent(nextId)}`);
		} catch (e) {
			emitErrorToast('发帖', e instanceof Error ? e.message : '发布失败，请稍后再试。');
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		void hydrateSession();
		void loadCategories();
	});
</script>

<svelte:head>
	<title>发布帖子 - 论坛 - 二叉树树</title>
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12 space-y-5">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:square-edit-outline" class="size-6 text-primary" />
					发布帖子
				</CardTitle>
				<Button variant="outline" href="/forum/">
					<Icon icon="mdi:arrow-left" class="size-4" />
					返回论坛
				</Button>
			</div>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if !$forumAuth.token}
				<Alert>
					<Icon icon="mdi:information-outline" />
					<AlertDescription class="flex flex-wrap items-center gap-2">
						<span>请先登录后再发布帖子。</span>
						<a
							href="/forum/auth/login/"
							class="text-primary underline decoration-dashed underline-offset-4"
						>
							去登录
						</a>
					</AlertDescription>
				</Alert>
			{/if}

			<div class="space-y-2">
				<Label for="post-title">标题</Label>
				<Input
					id="post-title"
					bind:value={title}
					placeholder="给帖子起一个标题"
					disabled={!$forumAuth.token || submitting}
				/>
			</div>

			<div class="space-y-2">
				<Label for="post-category">分类</Label>
				<Select
					type="single"
					value={categoryId}
					onValueChange={(v) => (categoryId = v ?? '')}
					disabled={categoriesLoading || !$forumAuth.token || submitting}
				>
					<SelectTrigger class="w-48" id="post-category">
						{categories.find((c) => c.id === categoryId)?.name || '未分类'}
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">未分类</SelectItem>
						{#each categories as item (item.id)}
							<SelectItem value={item.id}>{item.name}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="space-y-2">
				<Label>内容</Label>
				<ForumMarkdownEditor
					bind:value={content}
					mode="post"
					uploadType="post"
					placeholder="支持 Markdown，Ctrl/Cmd + Enter 发布"
					submitting={submitting || !$forumAuth.token}
					minHeight={520}
					onsubmit={submit}
				/>
			</div>

			<div class="flex items-center justify-end gap-2">
				<span class="text-xs text-muted-foreground">Ctrl/Cmd + Enter 发布</span>
				<Button
					onclick={submit}
					disabled={submitting || !$forumAuth.token || !title.trim() || !content.trim()}
				>
					{#if submitting}
						<Icon icon="mdi:loading" class="size-4 animate-spin" />
					{:else}
						<Icon icon="mdi:send" class="size-4" />
					{/if}
					发布
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
