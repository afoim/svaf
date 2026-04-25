<script lang="ts">
	import { page } from '$app/stores';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { tryDecodeShortLink } from '$lib/utils/zwShortLink';

	let open = $state(false);
	let target = $state('');
	let targetHost = $state('');

	$effect(() => {
		const pathname = $page.url.pathname;
		const decoded = tryDecodeShortLink(decodeURIComponent(pathname));
		if (!decoded) {
			open = false;
			document.body.style.overflow = '';
			return;
		}
		target = decoded;
		try {
			targetHost = new URL(decoded).host;
		} catch {
			targetHost = decoded;
		}
		open = true;
		document.body.style.overflow = 'hidden';
		try {
			window.history.replaceState({}, '', '/');
		} catch {
			// ignore
		}
	});

	function confirm() {
		window.location.replace(target);
	}

	function cancel() {
		open = false;
		document.body.style.overflow = '';
	}
</script>

{#if open}
	<!-- 完全不透明遮罩，盖掉所有页面背景 -->
	<div class="fixed inset-0 z-[60] flex items-center justify-center bg-background p-4">
		<Card class="w-full max-w-md">
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Icon icon="mdi:link-variant" class="size-5 text-primary" />
					即将跳转到外部链接
				</CardTitle>
				<p class="text-sm text-muted-foreground">
					该零宽短链将带你前往以下地址，请确认后再继续：
				</p>
			</CardHeader>
			<CardContent class="space-y-2">
				<div class="rounded-md border bg-muted/30 px-3 py-2">
					<p class="mb-1 text-xs text-muted-foreground">目标域名</p>
					<p class="text-sm font-medium break-all">{targetHost}</p>
				</div>
				<div class="rounded-md border bg-muted/30 px-3 py-2">
					<p class="mb-1 text-xs text-muted-foreground">完整 URL</p>
					<p class="text-sm break-all">{target}</p>
				</div>
			</CardContent>
			<CardFooter class="flex justify-end gap-2">
				<Button variant="outline" onclick={cancel}>取消</Button>
				<Button onclick={confirm}>
					<Icon icon="mdi:open-in-new" class="size-4" />
					继续访问
				</Button>
			</CardFooter>
		</Card>
	</div>
{/if}
