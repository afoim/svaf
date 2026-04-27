<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import Icon from '@iconify/svelte';
	import { forumAuth } from '$lib/forum/stores/auth';
	import { forumEnv } from '$lib/forum/stores/env';
	import { get } from 'svelte/store';
	import { getSession } from '$lib/forum/api/auth';
	import { emitErrorToast, emitSuccessToast } from '$lib/forum/utils/toast';
	import { ForumApiError } from '$lib/forum/types/api';
	import { getAdminUsers, toggleDrawBan } from '$lib/forum/api/admin';
	import {
		getDrawWorkflows,
		getDrawWorkflowCurrent,
		getDrawOutputList,
		getDrawImageUrl,
		getDrawOutputFileUrl,
		getDrawThumbnailUrl,
		getDrawOutputCreator,
		forkDrawOutput,
		interruptDraw,
		createDrawWebSocket,
		type DrawWorkflow,
		type DrawWorkflowDetail,
		type DrawOutputItem
	} from '$lib/forum/api/draw';
	import PageViews from '$lib/components/PageViews.svelte';

	let loading = $state(true);
	let authenticated = $state(false);
	let isAdmin = $state(false);

	// Workflow state
	let workflows = $state<DrawWorkflow[]>([]);
	let workflowSearch = $state('');
	let currentWorkflowPath = $state('');
	let currentDetail = $state<DrawWorkflowDetail | null>(null);
	let loadingWorkflows = $state(false);

	// Fork state
	let forkedWorkflow = $state<unknown>(null);
	let forkedMeta = $state<any>(null);

	// Form state
	let directTags = $state('');
	let nlPrompt = $state('');
	let rewriteMode = $state(true);
	let overrideMode = $state(false);
	let imgWidth = $state('');
	let imgHeight = $state('');
	let defaultWidth = $state<number | null>(null);
	let defaultHeight = $state<number | null>(null);

	// Generation state
	let generating = $state(false);
	let cooldownRemaining = $state(0);
	let cooldownTimer: ReturnType<typeof setInterval> | null = null;
	let progressText = $state('');
	let progressPct = $state(0);
	let showProgress = $state(false);
	let showProgressBar = $state(false);
	let logLines = $state<string[]>([]);
	let llmStream = $state('');
	let showLlm = $state(false);
	let finalPrompt = $state('');
	let resultImages = $state<{ url: string; filename: string }[]>([]);
	let showResult = $state(false);

	// Global status
	let globalBusy = $state(false);
	let globalStage = $state('');
	let globalMeta = $state('');
	let globalBarPct = $state(0);
	let globalBarText = $state('');
	let showGlobalBar = $state(false);

	// Gallery state
	let galleryItems = $state<DrawOutputItem[]>([]);
	let galleryTotal = $state(0);
	let galleryLoaded = $state(0);
	let showImages = $state(false);

	// Lightbox state
	let lightboxOpen = $state(false);
	let lightboxUrl = $state('');
	let lightboxTitle = $state('');
	let lightboxCreator = $state('');
	let lightboxTime = $state('');
	let lightboxBanning = $state(false);

	// WebSocket refs
	let activeWS: WebSocket | null = null;
	let statusWS: WebSocket | null = null;
	let statusReconnectTimer: ReturnType<typeof setTimeout> | null = null;

	const GALLERY_PAGE_SIZE = 50;
	const MAX_DIM = 1344;

	const RES_PRESETS = [
		{ w: 1024, h: 1344, label: 'WAI 推荐' },
		{ w: 832, h: 1216, label: 'NoobAI 推荐' },
		{ w: 1024, h: 1024, label: '大头照' },
		{ w: 512, h: 512, label: '测试模型' },
	];

	const STAGE_MAP: Record<string, string> = {
		loading: '加载工作流',
		llm: 'LLM 处理中',
		generating: '生图中',
	};

	let filteredWorkflows = $derived.by(() => {
		const q = workflowSearch.toLowerCase().trim();
		let list = q ? workflows.filter(w => w.path.toLowerCase().includes(q)) : [...workflows];
		const isNoLora = (w: DrawWorkflow) => /无\s*lora/i.test(w.path);
		list.sort((a, b) => (isNoLora(b) ? 1 : 0) - (isNoLora(a) ? 1 : 0));
		return list;
	});

	onMount(async () => {
		const token = forumAuth.getToken();
		if (!token) {
			loading = false;
			return;
		}
		try {
			const session = await getSession();
			forumAuth.setSession(session);
			authenticated = true;
			isAdmin = session.user?.role === 'admin';
		} catch {
			authenticated = false;
		}
		loading = false;

		if (authenticated) {
			currentWorkflowPath = localStorage.getItem('draw-currentWorkflow') || '';
			await Promise.all([loadWorkflows(), loadCurrentWorkflow(), loadGallery(true)]);
			connectStatus();
		}
	});

	onDestroy(() => {
		if (activeWS) { try { activeWS.close(); } catch {} activeWS = null; }
		if (statusWS) { try { statusWS.close(); } catch {} statusWS = null; }
		if (statusReconnectTimer) clearTimeout(statusReconnectTimer);
		if (cooldownTimer) clearInterval(cooldownTimer);
	});

	async function loadWorkflows() {
		loadingWorkflows = true;
		try {
			workflows = await getDrawWorkflows();
		} catch (e) {
			emitErrorToast('工作流', e instanceof Error ? e.message : '加载失败');
		}
		loadingWorkflows = false;
	}

	async function loadCurrentWorkflow() {
		if (forkedWorkflow) {
			applyForkToUI();
			return;
		}
		if (!currentWorkflowPath) {
			currentDetail = null;
			return;
		}
		try {
			currentDetail = await getDrawWorkflowCurrent(currentWorkflowPath);
			defaultWidth = currentDetail.default_width || null;
			defaultHeight = currentDetail.default_height || null;
		} catch {
			currentDetail = null;
		}
	}

	async function selectWorkflow(path: string) {
		forkedWorkflow = null;
		forkedMeta = null;
		currentWorkflowPath = path;
		localStorage.setItem('draw-currentWorkflow', path);
		await loadCurrentWorkflow();
	}

	function applyForkToUI() {
		if (!forkedMeta) return;
		defaultWidth = forkedMeta.default_width || null;
		defaultHeight = forkedMeta.default_height || null;
	}

	function clearFork() {
		forkedWorkflow = null;
		forkedMeta = null;
		loadCurrentWorkflow();
	}

	function copyBuiltinToTags() {
		const bp = forkedMeta?.builtin_prompt || currentDetail?.builtin_prompt || '';
		if (bp) {
			directTags = bp;
			emitSuccessToast('已复制', '内置 prompt 已复制到直接 Tag');
		}
	}

	// Generation
	async function startRun() {
		if (globalBusy) {
			emitErrorToast('服务器繁忙', '已有任务在执行');
			return;
		}
		if (!directTags.trim() && !nlPrompt.trim()) {
			if (!confirm('未输入任何 prompt，使用工作流内置 prompt？')) return;
		}
		const w = imgWidth ? parseInt(imgWidth) : null;
		const h = imgHeight ? parseInt(imgHeight) : null;
		if ((w && w > MAX_DIM) || (h && h > MAX_DIM)) {
			emitErrorToast('分辨率错误', `宽或高不得大于 ${MAX_DIM}`);
			return;
		}

		const payload = {
			workflow_path: forkedWorkflow ? '' : currentWorkflowPath,
			inline_workflow: forkedWorkflow || null,
			direct_prompt: directTags.trim(),
			nl_prompt: nlPrompt.trim(),
			rewrite: rewriteMode,
			override: overrideMode,
			width: w,
			height: h,
		};

		showProgress = true;
		showResult = false;
		logLines = [];
		llmStream = '';
		showLlm = false;
		progressText = '连接中...';
		progressPct = 0;
		showProgressBar = false;
		resultImages = [];
		finalPrompt = '';
		generating = true;

		try {
			const ws = await createDrawWebSocket('run');
			activeWS = ws;
			ws.onopen = () => ws.send(JSON.stringify(payload));
			ws.onmessage = (e) => handleMsg(JSON.parse(e.data));
			ws.onclose = (e) => {
				if (e.code === 4003) {
					appendLog('连接被拒绝：鉴权失败');
					progressText = '鉴权失败';
					emitErrorToast('生图', '连接被服务器拒绝，请重新登录');
				}
				finishRun();
			};
			ws.onerror = () => finishRun();
		} catch (e) {
			if (e instanceof ForumApiError && e.cooldown && e.remaining) {
				cooldownRemaining = e.remaining;
				if (cooldownTimer) clearInterval(cooldownTimer);
				cooldownTimer = setInterval(() => {
					cooldownRemaining -= 1;
					if (cooldownRemaining <= 0) {
						cooldownRemaining = 0;
						if (cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
					}
				}, 1000);
				showProgress = false;
				emitErrorToast('速率限制', `请等待 ${cooldownRemaining} 秒后再试`);
			} else {
				appendLog('连接失败: ' + (e instanceof Error ? e.message : String(e)));
				progressText = '连接失败';
				emitErrorToast('生图', e instanceof Error ? e.message : '连接失败');
			}
			generating = false;
		}
	}

	function handleMsg(m: any) {
		if (m.type === 'log') {
			appendLog(m.message);
		} else if (m.type === 'llm_start') {
			showLlm = true;
			llmStream = '';
		} else if (m.type === 'llm_chunk') {
			llmStream += m.delta;
		} else if (m.type === 'llm_done') {
			appendLog('LLM 完成');
		} else if (m.type === 'progress') {
			if (m.max && m.max > 1) {
				const pct = Math.floor((m.value || 0) * 100 / m.max);
				showProgressBar = true;
				progressPct = pct;
				progressText = `${m.node} ${m.value}/${m.max} (${pct}%)  节点 ${m.done || 0}/${m.total || 0}`;
			} else {
				progressText = `执行: ${m.node}`;
			}
		} else if (m.type === 'prompt_id') {
			finalPrompt = m.final_prompt || '';
			showResult = true;
		} else if (m.type === 'image') {
			const proxyUrl = rewriteBackendUrl(m.url);
			resultImages = [...resultImages, { url: proxyUrl, filename: m.filename }];
			prependGalleryItem(m.filename);
		} else if (m.type === 'done') {
			appendLog(`完成，共 ${m.count} 张`);
			progressText = '完成';
			if (m.final_prompt) finalPrompt = m.final_prompt;
			emitSuccessToast('生图成功', `共生成 ${m.count} 张图片`);
		} else if (m.type === 'error') {
			appendLog('错误: ' + m.message);
			progressText = '失败: ' + m.message;
			emitErrorToast('生图失败', m.message);
		}
	}

	function appendLog(line: string) {
		logLines = [...logLines, line];
	}

	function finishRun() {
		generating = false;
		activeWS = null;
	}

	function cancelRun() {
		appendLog('已取消');
		if (activeWS) {
			const ws = activeWS;
			activeWS = null;
			ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
			try { ws.close(); } catch {}
		}
		progressText = '已取消';
		finishRun();
		interruptDraw().catch(() => {});
	}

	// Global status WebSocket
	async function connectStatus() {
		try {
			statusWS = await createDrawWebSocket('status');
		} catch {
			statusReconnectTimer = setTimeout(connectStatus, 5000);
			return;
		}
		statusWS.onmessage = (e) => {
			let m: any;
			try { m = JSON.parse(e.data); } catch { return; }
			if (m.type === 'status') {
				applyGlobalStatus(m);
			} else if (m.type === 'mirror') {
				if (activeWS) return;
				handleMsg(m.event);
			}
		};
		statusWS.onclose = (e) => {
			statusWS = null;
			if (e.code === 4003) return;
			statusReconnectTimer = setTimeout(connectStatus, 3000);
		};
		statusWS.onerror = () => { try { statusWS?.close(); } catch {} };
	}

	function applyGlobalStatus(s: any) {
		globalBusy = !!s.busy;
		if (!s.busy) {
			globalStage = '';
			return;
		}
		globalStage = STAGE_MAP[s.stage] || '处理中';
		const meta: string[] = [];
		if (s.workflow) meta.push(s.workflow.replace(/\.json$/i, ''));
		if (s.started_at) {
			meta.push(Math.floor(Date.now() / 1000 - s.started_at) + 's');
		}
		globalMeta = meta.join(' · ');
		if (s.max && s.max > 1) {
			const pct = Math.floor((s.value || 0) * 100 / s.max);
			showGlobalBar = true;
			globalBarPct = pct;
			globalBarText = `${s.node || ''} ${s.value}/${s.max} (${pct}%)  节点 ${s.done || 0}/${s.total || 0}`;
		} else {
			showGlobalBar = false;
			globalBarText = s.node ? `执行: ${s.node}` : '';
		}
	}

	// Gallery
	async function loadGallery(reset = true) {
		if (reset) {
			galleryItems = [];
			galleryLoaded = 0;
		}
		try {
			const data = await getDrawOutputList(GALLERY_PAGE_SIZE, galleryLoaded);
			galleryTotal = data.total || 0;
			galleryItems = reset ? data.items : [...galleryItems, ...data.items];
			galleryLoaded = galleryItems.length;
		} catch (e) {
			emitErrorToast('画廊', e instanceof Error ? e.message : '加载失败');
		}
	}

	function prependGalleryItem(filename: string) {
		galleryItems = [{ path: filename }, ...galleryItems];
		galleryTotal += 1;
		galleryLoaded += 1;
	}

	// Lightbox
	function openLightbox(item: DrawOutputItem) {
		lightboxUrl = getDrawOutputFileUrl(item.path);
		lightboxTitle = item.path;
		lightboxCreator = '';
		if (item.mtime) {
			const d = new Date(item.mtime * 1000);
			const pad = (n: number) => String(n).padStart(2, '0');
			lightboxTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
		} else {
			lightboxTime = '';
		}
		lightboxOpen = true;
		getDrawOutputCreator(item.path).then(d => {
			if (d?.creator_name) lightboxCreator = d.creator_name;
			else if (d?.creator_ip) lightboxCreator = d.creator_ip;
		}).catch(() => {});
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	async function forkFromLightbox(path: string) {
		try {
			const d = await forkDrawOutput(path);
			forkedWorkflow = d.workflow;
			forkedMeta = {
				source_image: d.source_image || path,
				format: d.format,
				summary: d.summary,
				default_width: d.default_width,
				default_height: d.default_height,
				builtin_prompt: d.builtin_prompt,
				loras: d.loras,
			};
			applyForkToUI();
			closeLightbox();
			emitSuccessToast('Fork', '已临时还原工作流，可直接生图');
		} catch (e) {
			emitErrorToast('Fork 失败', e instanceof Error ? e.message : '未知错误');
		}
	}

	async function banCreatorFromLightbox() {
		if (!lightboxCreator || lightboxBanning) return;
		if (!confirm(`确定要禁止用户「${lightboxCreator}」使用生图功能吗？`)) return;
		lightboxBanning = true;
		try {
			const users = await getAdminUsers(lightboxCreator);
			const match = users.find(u => u.username === lightboxCreator);
			if (!match) {
				emitErrorToast('Ban', `未找到用户「${lightboxCreator}」`);
				return;
			}
			const r = await toggleDrawBan(match.id);
			emitSuccessToast('Ban', r.message || '操作成功');
		} catch (e) {
			emitErrorToast('Ban', e instanceof Error ? e.message : '操作失败');
		} finally {
			lightboxBanning = false;
		}
	}

	function escapeHtml(str: string): string {
		return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
	}

	function rewriteBackendUrl(url: string): string {
		if (url.startsWith('/api/')) {
			return `https://d.2x.nz${url}`;
		}
		return url;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
	}

	let builtinPrompt = $derived(
		forkedMeta?.builtin_prompt || currentDetail?.builtin_prompt || ''
	);

	let currentLoras = $derived(
		forkedMeta?.loras || currentDetail?.loras || []
	);
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>AI 生图 - 论坛</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-4 p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">AI 生图</h1>
		<div class="flex items-center gap-2">
			<PageViews pathname="/forum/draw/" />
			<Button variant="outline" href="/forum/">返回论坛</Button>
		</div>
	</div>

	{#if loading}
		<Card>
			<CardContent class="p-8 text-center">
				<Icon icon="mdi:loading" class="mx-auto size-8 animate-spin text-muted-foreground" />
				<p class="mt-2 text-sm text-muted-foreground">加载中...</p>
			</CardContent>
		</Card>
	{:else if !authenticated}
		<Alert>
			<Icon icon="mdi:lock-outline" class="size-5" />
			<AlertDescription>
				请先 <a href="/forum/auth/login/" class="font-medium text-primary underline">登录论坛</a> 后使用 AI 生图功能。
			</AlertDescription>
		</Alert>
	{:else}
		<!-- Global busy status -->
		{#if globalBusy}
			<Alert>
				<div class="flex items-center justify-between gap-2">
					<span class="font-semibold">⚙️ {globalStage}</span>
					<span class="text-xs text-muted-foreground">{globalMeta}</span>
				</div>
				{#if showGlobalBar}
					<div class="mt-2 h-2 w-full overflow-hidden rounded bg-muted">
						<div class="h-2 bg-amber-500 transition-all" style="width:{globalBarPct}%"></div>
					</div>
					<p class="mt-1 text-xs text-muted-foreground">{globalBarText}</p>
				{/if}
			</Alert>
		{/if}

		<!-- Current workflow -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-base">当前工作流</CardTitle>
				<Button variant="outline" size="sm" onclick={() => { loadCurrentWorkflow(); loadWorkflows(); }}>
					<Icon icon="mdi:refresh" class="size-4" />
					刷新
				</Button>
			</CardHeader>
			<CardContent>
				{#if forkedWorkflow && forkedMeta}
					<div class="flex items-start gap-3 rounded border-2 border-emerald-500 bg-emerald-50 p-3 dark:bg-emerald-950/20">
						<span class="text-2xl">🍴</span>
						<div class="min-w-0 flex-1">
							<p class="font-medium text-emerald-800 dark:text-emerald-300">临时 Fork（仅本浏览器）</p>
							<p class="text-xs text-muted-foreground">
								来源: {forkedMeta.source_image || ''} · 格式: {forkedMeta.format}
								{#if forkedMeta.summary}· 节点 {forkedMeta.summary.node_count}{/if}
							</p>
							{#if currentLoras.length > 0}
								<div class="mt-1 flex flex-wrap gap-1">
									{#each currentLoras as lora}
										<span class="inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{lora}</span>
									{/each}
								</div>
							{/if}
							<Button variant="outline" size="sm" class="mt-2" onclick={clearFork}>
								<Icon icon="mdi:close" class="size-3" /> 清除 Fork
							</Button>
						</div>
					</div>
				{:else if currentDetail}
					<div class="flex items-center gap-3">
						{#if currentDetail.thumbnail}
							<img src={getDrawThumbnailUrl(currentDetail.path)} alt="" class="h-16 w-16 flex-shrink-0 rounded border object-cover" />
						{/if}
						<div class="min-w-0">
							<p class="font-medium">{currentDetail.path.replace(/\.json$/i, '')}</p>
							{#if currentDetail.summary}
								<p class="text-xs text-muted-foreground">
									节点 {currentDetail.summary.node_count} | 连线 {currentDetail.summary.link_count} | 分组 {currentDetail.summary.group_count}
								</p>
							{/if}
							{#if currentLoras.length > 0}
								<div class="mt-1 flex flex-wrap gap-1">
									{#each currentLoras as lora}
										<span class="inline-block rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">{lora}</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">未选中工作流，请从下方列表中选择</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Workflow list -->
		<Card>
			<CardHeader>
				<CardTitle class="text-base">工作流列表</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<Input placeholder="搜索关键词..." bind:value={workflowSearch} />
				{#if loadingWorkflows}
					<div class="p-4 text-center text-sm text-muted-foreground">
						<Icon icon="mdi:loading" class="inline size-4 animate-spin" /> 加载中...
					</div>
				{:else if filteredWorkflows.length === 0}
					<p class="p-2 text-sm text-muted-foreground">无匹配工作流</p>
				{:else}
					<div class="flex max-h-96 flex-wrap gap-2 overflow-y-auto">
						{#each filteredWorkflows as wf (wf.path)}
							{@const stem = wf.path.replace(/\.json$/i, '')}
							{@const idx = stem.indexOf(' - ')}
							{@const model = idx >= 0 ? stem.slice(0, idx) : stem}
							{@const custom = idx >= 0 ? stem.slice(idx + 3) : ''}
							{@const isNoLora = /无\s*lora/i.test(wf.path)}
							<button
								class="flex w-20 cursor-pointer flex-col items-center gap-0.5 overflow-hidden rounded border p-1.5 transition-colors
								{isNoLora ? 'border-2 border-amber-400 bg-amber-50 ring-2 ring-amber-200 hover:bg-amber-100 dark:bg-amber-950/20' : 'hover:border-primary hover:bg-accent'}
								{currentWorkflowPath === wf.path && !forkedWorkflow ? 'ring-2 ring-primary' : ''}"
								title={wf.path}
								onclick={() => selectWorkflow(wf.path)}
							>
								{#if wf.thumbnail}
									<img src={getDrawThumbnailUrl(wf.path)} alt="" class="h-12 w-12 rounded bg-muted object-cover" loading="lazy" />
								{:else}
									<div class="flex h-12 w-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">无图</div>
								{/if}
								<span class="line-clamp-2 w-full break-all text-center text-[11px] font-medium leading-tight">{model}</span>
								{#if custom}
									<span class="line-clamp-1 w-full break-all text-center text-[10px] leading-tight text-muted-foreground">{custom}</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Generation form -->
		<Card>
			<CardHeader>
				<CardTitle class="text-base">生成图片</CardTitle>
			</CardHeader>
			<CardContent class="space-y-3">
				<div class="rounded border border-pink-200 bg-pink-50 p-2 text-xs text-pink-900 dark:border-pink-800 dark:bg-pink-950/20 dark:text-pink-300">
					💕 <strong>第一次用 AI 生图？</strong>
					看这篇手把手教程：
					<a href="https://2x.nz/posts/ai-wife" target="_blank" rel="noopener"
						class="font-medium underline hover:text-pink-700">从零开始造老婆 →</a>
				</div>

				<div class="rounded border border-purple-200 bg-purple-50 p-2 text-xs text-purple-900 dark:border-purple-800 dark:bg-purple-950/20 dark:text-purple-300">
					🎨 想换 <strong>Q 版 / 厚涂 / 像素 / 写实</strong> 等画风？试试在直接 Tag 里加上画师词条，参考
					<a href="https://www.downloadmost.com/NoobAI-XL/danbooru-artist/" target="_blank" rel="noopener"
						class="underline hover:text-purple-700">danbooru-artist 画师库</a>
					（格式：<code class="rounded bg-white/70 px-1 dark:bg-white/10">by xxx</code>，可加括号调权重，如 <code class="rounded bg-white/70 px-1 dark:bg-white/10">(by xxx:1.2)</code>）。
				</div>

				<div class="rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
					👤 想画<strong>不同角色</strong>？请切换到<strong>无 Lora</strong> 的工作流（避免 Lora 强行把人物拉回原角色），
					然后在直接 Tag 里加上角色词条，参考
					<a href="https://www.downloadmost.com/NoobAI-XL/danbooru-character/" target="_blank" rel="noopener"
						class="underline hover:text-blue-700">danbooru-character 角色库</a>。
				</div>

				<div class="space-y-1">
					<Label>直接 Tag</Label>
					<textarea
						bind:value={directTags}
						rows="2"
						placeholder="可选：直接英文 tags（逗号分隔）"
						class="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
					></textarea>
				</div>

				<div class="space-y-1">
					<Label>自然语言描述</Label>
					<textarea
						bind:value={nlPrompt}
						rows="3"
						placeholder="可选：中文/英文自然语言，会经过 LLM 处理"
						class="w-full rounded-md border bg-background px-3 py-2 text-sm"
					></textarea>
				</div>

				<div class="flex flex-wrap gap-4 text-sm">
					<label class="flex items-center gap-2">
						<Checkbox bind:checked={rewriteMode} />
						<span>改写模式</span>
					</label>
					<label class="flex items-center gap-2">
						<Checkbox bind:checked={overrideMode} />
						<span>覆写模式</span>
					</label>
				</div>
				<p class="text-xs text-muted-foreground">
					改写模式：LLM 基于「直接 Tag」或内置 prompt 作为底本，结合「自然语言描述」整体重写。
					未勾选时为追加模式。
					<span class="text-orange-600 dark:text-orange-400">覆写模式：完全忽略工作流内置 prompt。</span>
				</p>

				{#if builtinPrompt}
					<div class="rounded border bg-muted/30 p-2">
						<div class="mb-1 flex items-center justify-between">
							<span class="text-xs text-muted-foreground">📦 当前工作流内置 prompt：</span>
							<Button variant="ghost" size="sm" onclick={copyBuiltinToTags}>
								复制到「直接 Tag」
							</Button>
						</div>
						<pre class="max-h-32 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs">{builtinPrompt}</pre>
					</div>
				{/if}

				<div class="flex flex-wrap items-end gap-2">
					<div class="space-y-1">
						<Label class="text-xs">宽 width</Label>
						<Input type="number" min="64" max={MAX_DIM} step="8" placeholder={defaultWidth?.toString() || '默认'} bind:value={imgWidth} class="w-28" />
					</div>
					<div class="space-y-1">
						<Label class="text-xs">高 height</Label>
						<Input type="number" min="64" max={MAX_DIM} step="8" placeholder={defaultHeight?.toString() || '默认'} bind:value={imgHeight} class="w-28" />
					</div>
					<Button variant="outline" size="sm" onclick={() => { imgWidth = ''; imgHeight = ''; }}>恢复默认</Button>
					{#if defaultWidth && defaultHeight}
						<span class="text-xs text-muted-foreground">默认 {defaultWidth}×{defaultHeight}</span>
					{/if}
				</div>
				<div class="flex flex-wrap gap-2">
					{#each RES_PRESETS as p}
						<Button variant="outline" size="sm" onclick={() => { imgWidth = String(p.w); imgHeight = String(p.h); }}>
							{p.w}×{p.h} <span class="ml-1 text-muted-foreground">{p.label}</span>
						</Button>
					{/each}
				</div>

				<div class="flex items-center gap-2">
					<Button onclick={startRun} disabled={generating || cooldownRemaining > 0 || (globalBusy && !activeWS)}>
						{#if generating}
							<Icon icon="mdi:loading" class="size-4 animate-spin" />
						{/if}
						{#if cooldownRemaining > 0}
							⏳ 冷却中 {cooldownRemaining}s
						{:else}
							▶ 开始生成
						{/if}
					</Button>
					{#if generating}
						<Button variant="destructive" onclick={cancelRun}>
							✕ 取消
						</Button>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Progress -->
		{#if showProgress}
			<Card>
				<CardHeader>
					<CardTitle class="text-base">⏳ 进度</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2">
					{#if showProgressBar}
						<div class="h-3 w-full overflow-hidden rounded bg-muted">
							<div class="h-3 bg-primary transition-all" style="width:{progressPct}%"></div>
						</div>
					{/if}
					<p class="text-sm">{progressText}</p>

					{#if showLlm}
						<div>
							<p class="mb-1 text-xs text-muted-foreground">🤖 LLM 流式输出：</p>
							<pre class="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded border bg-amber-50 p-2 font-mono text-xs dark:bg-amber-950/20">{llmStream}</pre>
						</div>
					{/if}

					{#if logLines.length > 0}
						<pre class="max-h-40 overflow-y-auto rounded bg-muted p-2 text-xs">{logLines.join('\n')}</pre>
					{/if}
				</CardContent>
			</Card>
		{/if}

		<!-- Results -->
		{#if showResult}
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-base">🖼️ 结果</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2">
					{#if finalPrompt}
						<pre class="whitespace-pre-wrap break-words rounded bg-muted p-2 font-mono text-xs">{finalPrompt}</pre>
					{/if}
					<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
						{#each resultImages as img}
							<div>
								<img src={img.url} alt={img.filename} class="w-full rounded border hover:ring-2 hover:ring-primary" loading="lazy" />
								<p class="mt-1 break-all text-xs text-muted-foreground">{img.filename}</p>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}

		<!-- Gallery -->
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-base">
					🖼️ 所有生成图片
					<span class="text-xs font-normal text-muted-foreground">({galleryLoaded}/{galleryTotal})</span>
				</CardTitle>
				<div class="flex items-center gap-3">
					<label class="flex cursor-pointer items-center gap-1 text-xs">
						<Checkbox bind:checked={showImages} />
						<span>显示图片</span>
					</label>
					<Button variant="outline" size="sm" onclick={() => loadGallery(true)}>
						<Icon icon="mdi:refresh" class="size-3" /> 重载
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
					{#each galleryItems as item, i (i)}
						<button
							class="group relative block overflow-hidden rounded border bg-muted"
							title={item.path}
							onclick={() => openLightbox(item)}
						>
							{#if showImages}
								<img
									src={getDrawOutputFileUrl(item.path)}
									alt={item.path}
									class="aspect-square w-full object-cover transition-all group-hover:ring-2 group-hover:ring-primary"
									loading="lazy"
								/>
							{:else}
								<div class="flex aspect-square w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--color-muted)_0_8px,var(--color-muted-foreground/.1)_8px_16px)]">
									<span class="text-xs text-muted-foreground">🔒 已隐藏</span>
								</div>
							{/if}
						</button>
					{/each}
				</div>
				{#if galleryLoaded < galleryTotal}
					<div class="mt-3 text-center">
						<Button variant="outline" size="sm" onclick={() => loadGallery(false)}>加载更多</Button>
					</div>
				{/if}
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Lightbox -->
{#if lightboxOpen}
	<div
		class="fixed inset-0 z-50 flex flex-col bg-black"
		role="dialog"
		aria-modal="true"
	>
		<button class="absolute right-3 top-2 z-10 text-3xl text-white" onclick={closeLightbox}>×</button>
		<div class="flex flex-1 items-center justify-center overflow-hidden p-2">
			<img src={lightboxUrl} alt={lightboxTitle} class="max-h-full max-w-full object-contain" />
		</div>
		<div class="flex flex-wrap items-center gap-2 bg-black/50 px-3 py-2 text-xs text-white">
			<span class="mr-auto break-all text-gray-300">{lightboxTitle}</span>
			{#if lightboxTime}
				<span class="text-gray-300">🕒 {lightboxTime}</span>
			{/if}
			{#if lightboxCreator}
				<span class="text-amber-300">by {lightboxCreator}</span>
			{/if}
			<a
				href={getDrawOutputFileUrl(lightboxTitle, true)}
				target="_blank"
				rel="noopener"
				download
				class="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
			>⬇ 下载原图</a>
			<button
				class="rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700"
				onclick={() => forkFromLightbox(lightboxTitle)}
			>🍴 Fork 工作流</button>
			{#if isAdmin && lightboxCreator}
				<button
					class="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
					onclick={banCreatorFromLightbox}
					disabled={lightboxBanning}
				>{lightboxBanning ? '处理中...' : `🚫 禁止 ${lightboxCreator} 生图`}</button>
			{/if}
		</div>
	</div>
{/if}
