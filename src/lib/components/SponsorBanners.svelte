<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
</script>

<div class="w-full max-w-md flex flex-col gap-4">
	<!-- DeepWiki -->
	<a
		href="https://deepwiki.com/afoim/svaf"
		target="_blank"
		rel="noopener noreferrer"
		class="block"
	>
		<Button variant="outline" size="lg" class="w-full border-2 border-primary text-primary font-bold hover:bg-primary hover:text-primary-foreground">
			<Icon icon="mdi:message-question-outline" class="size-5" />
			有疑问？询问 DeepWiki！
		</Button>
	</a>

	<!-- Secbit -->
	<a
		href="https://secbit.ai/"
		target="_blank"
		rel="noopener noreferrer"
		class="block w-full overflow-hidden rounded-lg ring-1 ring-foreground/10 transition-opacity hover:opacity-90"
	>
		<img src="/aff/secbit-banner-1.gif" alt="Secbit" width="280" height="35" class="w-full" />
	</a>

	<!-- YXvm + NodeSeek (NodeSupport) -->
	<div class="overflow-hidden rounded-lg">
		<div
			class="space-y-4 border border-[#27344a] p-6"
			style="background: linear-gradient(to top right, rgb(7 16 45), rgb(58 60 84));"
		>
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<a
						href="https://yxvm.com/"
						target="_blank"
						rel="noopener noreferrer"
						class="block w-[100px]"
					>
						<img src="/aff/nodeget/yxvm.png" alt="yxvm" class="w-full" />
					</a>
					<span class="text-xl font-bold text-white">+</span>
					<a
						href="https://www.nodeseek.com"
						target="_blank"
						rel="noopener noreferrer"
						class="block w-10"
					>
						<img src="/aff/nodeget/nodeseek.png" alt="nodeseek" class="w-full" />
					</a>
				</div>
				<a
					href="https://github.com/NodeSeekDev/NodeSupport"
					target="_blank"
					rel="noopener noreferrer"
					class="text-slate-400 hover:text-sky-400"
					aria-label="GitHub"
				>
					<Icon icon="mdi:github" class="size-5" />
				</a>
			</div>
			<h2 class="text-lg font-medium capitalize text-white">NodeSupport Project</h2>
			<p class="text-sm text-slate-400">
				Provide free server sponsorship to high-quality blogs, channels, open-source projects, and
				popular app.
			</p>
			<div class="flex justify-end gap-1 text-[13px] font-medium text-zinc-200">
				<span>Support ID:</span><span>316</span>
			</div>
		</div>
		<iframe
			title="Advertisement"
			src="https://support.nodeget.com/page/promotion?id=316"
			style="border:none; width:1px; height:1px; opacity:0; pointer-events:none; position:absolute; left:-9999px; top:0;"
			tabindex="-1"
			aria-hidden="true"
		></iframe>
	</div>
</div>
