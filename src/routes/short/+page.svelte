<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import Icon from '@iconify/svelte';
	import PageViews from '$lib/components/PageViews.svelte';
	import { ZW_PREFIX, encodeUrl, decodeUrl, visualizeZwChars } from '$lib/utils/zwShortLink';

	type GeneratedLink = {
		targetUrl: string;
		shortLink: string;
		encodedPart: string;
		charCount: number;
	};

	let targetUrl = $state('');
	let generatedLinks = $state<GeneratedLink[]>([]);
	let isGenerating = $state(false);
	let errorMessage = $state('');
	let baseUrl = $state('');

	onMount(() => {
		baseUrl = window.location.origin;
	});

	function isValidUrl(url: string) {
		if (!url || url.trim() === '') return false;
		try {
			const parsed = new URL(url);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	}

	function generateShortLink() {
		errorMessage = '';
		if (!isValidUrl(targetUrl)) {
			errorMessage = '请输入有效的 HTTP/HTTPS URL';
			return;
		}
		isGenerating = true;
		try {
			const encodedPart = encodeUrl(targetUrl);
			const shortLink = `${baseUrl}/${ZW_PREFIX}${encodedPart}`;
			if (decodeUrl(encodedPart) !== targetUrl) throw new Error('编码验证失败');
			generatedLinks = [
				{ targetUrl, shortLink, encodedPart, charCount: encodedPart.length },
				...generatedLinks
			];
			targetUrl = '';
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : '生成失败';
		} finally {
			isGenerating = false;
		}
	}

	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			alert('已复制到剪贴板！');
		} catch {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			alert('已复制到剪贴板！');
		}
	}

	function clearHistory() {
		generatedLinks = [];
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') generateShortLink();
	}
</script>

<svelte:head>
	<title>零宽短链生成器 - 二叉树树</title>
	<meta name="description" content="生成视觉上相同的隐形短链接" />
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mynaui:zero-circle-solid" class="size-6 text-primary" />
					零宽短链生成器
				</CardTitle>
				<PageViews pathname="/short/" class="text-sm text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground leading-relaxed">
				使用 UTF-8 零宽字符在 URL 路径中编码完整链接，生成视觉上完全相同的隐形短链接。
				访问者打开链接时，前端会自动解码并跳转到目标地址。所有链接看起来都是
				<code class="rounded bg-muted px-1.5 py-0.5 text-xs">/</code>（和首页完全相同）。
			</p>
		</CardContent>
	</Card>

	<!-- 输入区域 -->
	<Card>
		<CardHeader>
			<CardTitle>生成短链接</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if errorMessage}
				<Alert variant="destructive">
					<Icon icon="mdi:alert-circle-outline" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			{/if}

			<div class="space-y-2">
				<Label for="target-url">目标 URL</Label>
				<Input
					id="target-url"
					type="url"
					bind:value={targetUrl}
					placeholder="https://example.com"
					onkeydown={handleKeydown}
				/>
			</div>

			<Button onclick={generateShortLink} disabled={isGenerating || !targetUrl}>
				<Icon icon="mdi:link-plus" class="size-4" />
				{isGenerating ? '生成中...' : '生成短链接'}
			</Button>
		</CardContent>
	</Card>

	<!-- 生成历史 -->
	{#if generatedLinks.length > 0}
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<CardTitle>生成的链接</CardTitle>
					<Button variant="outline" size="sm" onclick={clearHistory}>清除历史</Button>
				</div>
			</CardHeader>
			<CardContent class="space-y-4">
				{#each generatedLinks as link (link.shortLink)}
					<div class="rounded-lg border bg-muted/30 p-4 space-y-3">
						<div>
							<p class="mb-1 text-xs text-muted-foreground">目标 URL</p>
							<p class="text-sm break-all">{link.targetUrl}</p>
						</div>

						<div>
							<p class="mb-1 text-xs text-muted-foreground">短链接（点击复制）</p>
							<button
								type="button"
								onclick={() => copyToClipboard(link.shortLink)}
								class="w-full rounded-md border bg-background px-3 py-2 text-left text-sm break-all transition-colors hover:bg-accent"
							>
								{link.shortLink}
							</button>
						</div>

						<div>
							<p class="mb-1 text-xs text-muted-foreground">编码可视化（○=ZWSP, ●=ZWNJ）</p>
							<div class="rounded-md border bg-background px-3 py-2">
								<p class="font-mono text-xs text-muted-foreground break-all">
									/○●○●{visualizeZwChars(link.encodedPart)}
								</p>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span>编码长度: {link.charCount} 个零宽字符</span>
							<span>·</span>
							<span>原始 URL: {link.targetUrl.length} 字符</span>
						</div>

						<div class="flex flex-wrap gap-2">
							<Button variant="outline" size="sm" onclick={() => copyToClipboard(link.shortLink)}>
								<Icon icon="mdi:content-copy" class="size-3.5" />
								复制链接
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => copyToClipboard(link.encodedPart)}
							>
								<Icon icon="mdi:code-tags" class="size-3.5" />
								复制编码部分
							</Button>
							<a href={link.shortLink} target="_blank" rel="noopener noreferrer">
								<Button size="sm">
									<Icon icon="mdi:open-in-new" class="size-3.5" />
									测试跳转
								</Button>
							</a>
						</div>
					</div>
				{/each}
			</CardContent>
		</Card>
	{/if}

	<!-- 原理说明 -->
	<Card>
		<CardHeader>
			<CardTitle>原理说明</CardTitle>
		</CardHeader>
		<CardContent>
			<ul class="space-y-3 text-sm leading-relaxed text-muted-foreground">
				<li>
					<span class="font-medium text-foreground">编码原理：</span>
					使用 UTF-8 零宽字符（ZWSP \u200B 和 ZWNJ \u200C）作为二进制字母表，
					将目标 URL 的每个字节编码为 8 个零宽字符。
				</li>
				<li>
					<span class="font-medium text-foreground">链接格式：</span>
					生成的链接格式为
					<code class="rounded bg-muted px-1 text-xs">/&lt;固定前缀&gt;&lt;零宽编码&gt;</code>，零宽字符在浏览器地址栏中不可见，
					所以不同 URL 生成的链接看起来完全一样（都显示为
					<code class="rounded bg-muted px-1 text-xs">/</code>，和首页完全相同）。
				</li>
				<li>
					<span class="font-medium text-foreground">解码流程：</span>
					访问者打开链接时，前端 JavaScript 会从 URL 路径中提取零宽字符、解码还原目标 URL，然后执行跳转。
				</li>
				<li>
					<span class="font-medium text-foreground">注意事项：</span>
					编码后的 URL 长度约为原始 URL 的 8 倍（每个字节编码为 8 个零宽字符），
					请避免编码过长的 URL，以免超过浏览器 URL 长度限制。
				</li>
			</ul>
		</CardContent>
	</Card>

	<!-- 演示区域 -->
	{#if baseUrl}
		<Card>
			<CardHeader>
				<CardTitle>演示对比</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<p class="text-sm text-muted-foreground">
					以下两个链接视觉上完全相同（路径中的零宽字符不可见），但跳转不同目标（点击可测试）：
				</p>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="rounded-lg border bg-muted/30 p-4">
						<p class="mb-2 text-xs text-muted-foreground">链接 A → example.com</p>
						<a
							href="/{ZW_PREFIX}{encodeUrl('https://example.com')}"
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-primary hover:underline"
						>
							/
						</a>
						<p class="mt-2 font-mono text-xs text-muted-foreground break-all">
							实际编码: ○●○●{visualizeZwChars(encodeUrl('https://example.com'))}
						</p>
					</div>
					<div class="rounded-lg border bg-muted/30 p-4">
						<p class="mb-2 text-xs text-muted-foreground">链接 B → google.com</p>
						<a
							href="/{ZW_PREFIX}{encodeUrl('https://google.com')}"
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-primary hover:underline"
						>
							/
						</a>
						<p class="mt-2 font-mono text-xs text-muted-foreground break-all">
							实际编码: ○●○●{visualizeZwChars(encodeUrl('https://google.com'))}
						</p>
					</div>
				</div>
				<p class="text-xs text-muted-foreground">
					两个链接都显示为
					<code class="rounded bg-muted px-1 text-xs">/</code>，但点击后会跳转到不同网站。
				</p>
			</CardContent>
		</Card>
	{/if}
</div>
