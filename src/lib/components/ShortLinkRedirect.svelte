<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { tryDecodeShortLink } from '$lib/utils/zwShortLink';

	let open = $state(false);
	let target = $state('');
	let targetHost = $state('');

	onMount(() => {
		const decoded = tryDecodeShortLink(window.location.pathname);
		if (!decoded) return;
		target = decoded;
		try {
			targetHost = new URL(decoded).host;
		} catch {
			targetHost = decoded;
		}
		open = true;
		// 清理地址栏中的零宽字符（替换为根路径），避免用户分享时再被提示
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
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Icon icon="mdi:link-variant" class="size-5 text-primary" />
				即将跳转到外部链接
			</Dialog.Title>
			<Dialog.Description>
				该零宽短链将带你前往以下地址，请确认后再继续：
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-2">
			<div class="rounded-md border bg-muted/30 px-3 py-2">
				<p class="text-xs text-muted-foreground mb-1">目标域名</p>
				<p class="text-sm font-medium break-all">{targetHost}</p>
			</div>
			<div class="rounded-md border bg-muted/30 px-3 py-2">
				<p class="text-xs text-muted-foreground mb-1">完整 URL</p>
				<p class="text-sm break-all">{target}</p>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={cancel}>取消</Button>
			<Button onclick={confirm}>
				<Icon icon="mdi:open-in-new" class="size-4" />
				继续访问
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
