<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import PageViews from '$lib/components/PageViews.svelte';

	const LONG_DOMAIN =
		'https://iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii.in';

	let targetUrl = $state('');
	let generatedLink = $state('');
	let isGenerating = $state(false);
	let errorMessage = $state('');

	function stringToBinary(str: string) {
		return Array.from(new TextEncoder().encode(str))
			.map((b) => b.toString(2).padStart(8, '0'))
			.join('');
	}

	function binaryToiI(binary: string) {
		return binary
			.split('')
			.map((bit) => (bit === '0' ? 'i' : 'I'))
			.join('');
	}

	function encodeUrl(url: string) {
		const data = { url, created: Date.now(), expires: null, permanent: true };
		return binaryToiI(stringToBinary(JSON.stringify(data)));
	}

	function isValidUrl(url: string) {
		if (!url || url.trim() === '') return false;
		try {
			const parsed = new URL(url);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	}

	function generateLongLink() {
		errorMessage = '';
		generatedLink = '';
		if (!isValidUrl(targetUrl)) {
			errorMessage = '请输入有效的 HTTP/HTTPS URL';
			return;
		}
		isGenerating = true;
		try {
			generatedLink = `${LONG_DOMAIN}/${encodeUrl(targetUrl)}`;
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
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
			alert('已复制到剪贴板！');
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') generateLongLink();
	}
</script>

<svelte:head>
	<title>长链生成器 - 二叉树树</title>
	<meta name="description" content="生成 i/I 字符编码的超长链接" />
</svelte:head>

<div class="container mx-auto max-w-3xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:link-variant-plus" class="size-6 text-primary" />
					长链生成器
				</CardTitle>
				<PageViews pathname="/long/" class="text-sm text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground leading-relaxed">
				将 URL 编码为 i/I 字符组成的极长链接，生成的链接可直接点击跳转到目标地址。
			</p>
		</CardContent>
	</Card>

	<!-- 输入区域 -->
	<Card>
		<CardHeader>
			<CardTitle>生成长链</CardTitle>
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

			<Button onclick={generateLongLink} disabled={isGenerating || !targetUrl}>
				<Icon icon="mdi:link-plus" class="size-4" />
				{isGenerating ? '生成中...' : '生成长链'}
			</Button>
		</CardContent>
	</Card>

	{#if generatedLink}
		<Card>
			<CardHeader>
				<CardTitle>生成结果</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<p class="mb-1 text-xs text-muted-foreground">原始 URL</p>
					<p class="text-sm break-all">{targetUrl}</p>
				</div>
				<div>
					<p class="mb-1 text-xs text-muted-foreground">生成的长链</p>
					<div class="rounded-md border bg-muted/30 p-3 max-w-full">
						<a
							href={generatedLink}
							target="_blank"
							rel="noopener noreferrer"
							class="font-mono text-xs break-all hover:text-primary hover:underline"
						>
							{generatedLink}
						</a>
					</div>
				</div>
				<p class="text-xs text-muted-foreground">链接长度: {generatedLink.length} 字符</p>
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onclick={() => copyToClipboard(generatedLink)}>
						<Icon icon="mdi:content-copy" class="size-3.5" />
						复制链接
					</Button>
					<a href={generatedLink} target="_blank" rel="noopener noreferrer">
						<Button size="sm">
							<Icon icon="mdi:open-in-new" class="size-3.5" />
							打开链接
						</Button>
					</a>
				</div>
			</CardContent>
		</Card>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>原理说明</CardTitle>
		</CardHeader>
		<CardContent>
			<ul class="space-y-3 text-sm leading-relaxed text-muted-foreground">
				<li>
					<span class="font-medium text-foreground">编码原理：</span>
					将目标 URL 转换为二进制，再将二进制中的 0 替换为 i、1 替换为 I。
				</li>
				<li>
					<span class="font-medium text-foreground">链接格式：</span>
					生成的链接格式为
					<code class="rounded bg-muted px-1 text-xs break-all">{LONG_DOMAIN}/{'{i/I编码}'}</code>，
					链接长度取决于原始数据量。
				</li>
				<li>
					<span class="font-medium text-foreground">跳转方式：</span>
					点击链接后，目标服务器负责解码 i/I 编码并跳转到原始 URL。
				</li>
			</ul>
		</CardContent>
	</Card>
</div>
