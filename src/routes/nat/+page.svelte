<script lang="ts">
	import { tick } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import PageViews from '$lib/components/PageViews.svelte';

	const API_URL = 'https://nat.2x.nz/api/analyze';
	const PRIMARY_HOST = '217.142.241.80';
	const SECONDARY_HOST = '64.110.98.108';

	let logs = $state<string[]>(['System ready.']);
	let isTesting = $state(false);
	let resultData = $state<{ type?: string; label?: string; details?: string } | null>(null);
	let logsContainer: HTMLElement | undefined = $state();

	async function scrollToBottom() {
		await tick();
		if (logsContainer) logsContainer.scrollTop = logsContainer.scrollHeight;
	}

	function logItem(msg: string) {
		logs = [...logs, `> ${msg}`];
		scrollToBottom();
	}

	async function gatherCandidates(primaryHost: string, secHost: string) {
		logItem('Initializing WebRTC ICE Agent...');
		const iceServers: RTCIceServer[] = [
			{ urls: `stun:${primaryHost}:3478` },
			{ urls: `stun:${primaryHost}:3479` }
		];
		if (secHost) iceServers.push({ urls: `stun:${secHost}:3478` });

		const pc = new RTCPeerConnection({ iceServers });
		pc.createDataChannel('probe');

		const hostSet = new Set<string>();
		const srflxSet = new Map<string, { ip: string; port: number }>();
		let resolved = false;

		let bUfrag = '';
		let bPwd = '';
		const sUfrag = Math.random().toString(36).substring(2, 10);
		const sPwd = (
			Math.random().toString(36).substring(2) +
			Math.random().toString(36).substring(2) +
			'abcdefghijklmnop'
		).substring(0, 26);

		return new Promise<{ data: any; pc: RTCPeerConnection }>((resolve, reject) => {
			const complete = () => {
				if (resolved) return;
				resolved = true;
				logItem(`Gathered ${srflxSet.size} unique srflx mappings.`);
				resolve({
					data: {
						localIPs: [...hostSet],
						srflx: [...srflxSet.values()],
						browser_ufrag: bUfrag,
						browser_pwd: bPwd,
						server_ufrag: sUfrag
					},
					pc
				});
			};

			pc.onicecandidate = (e) => {
				if (!e.candidate) {
					logItem('ICE gathering completed.');
					logItem(
						`Collected ${hostSet.size} host IPs: ${[...hostSet].join(', ') || 'none'}`
					);
					complete();
					return;
				}
				const cand = e.candidate.candidate;
				logItem(`Candidate: ${cand.split(' ').slice(4, 8).join(' ')}`);

				const parts = cand.split(' ');
				const ip = parts[4];
				const port = Number.parseInt(parts[5]);
				const typ = parts[7];

				if (typ === 'host' && ip && !ip.startsWith('169.254') && ip !== '0.0.0.0') {
					hostSet.add(ip);
					logItem(`Added host IP: ${ip}`);
				}
				if (typ === 'srflx') {
					srflxSet.set(`${ip}:${port}`, { ip, port });
					logItem(`Added srflx mapping: ${ip}:${port}`);
				}
			};

			pc.createOffer()
				.then(async (offer) => {
					await pc.setLocalDescription(offer);
					logItem('Offer created. Listening on local port...');

					const sdp = offer.sdp || '';
					const uMatch = sdp.match(/a=ice-ufrag:(.+)/);
					const pMatch = sdp.match(/a=ice-pwd:(.+)/);
					if (uMatch) bUfrag = uMatch[1].trim();
					if (pMatch) bPwd = pMatch[1].trim();

					const lines = sdp.split('\n');
					const ansLines: string[] = [];
					for (let l of lines) {
						l = l.trim();
						if (!l) continue;
						if (l.startsWith('a=setup:')) ansLines.push('a=setup:active');
						else if (l.startsWith('a=ice-ufrag:')) ansLines.push(`a=ice-ufrag:${sUfrag}`);
						else if (l.startsWith('a=ice-pwd:')) ansLines.push(`a=ice-pwd:${sPwd}`);
						else if (l.includes('candidate:')) continue;
						else if (l.startsWith('a=ice-options:')) continue;
						else ansLines.push(l);
					}
					ansLines.push('a=candidate:1 1 udp 2113937151 192.0.2.1 9 typ host');

					await pc.setRemoteDescription({
						type: 'answer',
						sdp: ansLines.join('\r\n') + '\r\n'
					});
					logItem('Dummy RemoteDescription applied. Active response enabled.');
				})
				.catch(reject);

			Promise.race([
				new Promise<void>((res) => {
					pc.addEventListener('iceconnectionstatechange', () => {
						if (
							pc.iceConnectionState === 'completed' ||
							pc.iceConnectionState === 'failed'
						)
							res();
					});
				}),
				new Promise<void>((res) => {
					const start = Date.now();
					const check = () => {
						if (Date.now() - start >= 3500) res();
						else requestAnimationFrame(check);
					};
					check();
				})
			]).then(complete);
		});
	}

	async function startTest() {
		isTesting = true;
		resultData = null;
		logs = [];
		logItem('System ready.');

		let pc: RTCPeerConnection | null = null;
		try {
			const res = await gatherCandidates(PRIMARY_HOST, SECONDARY_HOST);
			pc = res.pc;
			logItem('Sending context to server for deep active inspection...');
			logItem('Awaiting active filtering UDP probes...');

			const r = await fetch(API_URL, {
				method: 'POST',
				body: JSON.stringify(res.data),
				headers: { 'Content-Type': 'application/json' }
			});
			const json = await r.json();
			logItem(`Server detection result: ${json.type}`);
			resultData = json;
			scrollToBottom();
		} catch (e) {
			logItem(`Error: ${(e as Error).message}`);
			logItem('提示: 后端可能未启动，或者存在 CORS 跨域限制。');
		} finally {
			if (pc) {
				pc.close();
				logItem('WebRTC connection closed.');
			}
			isTesting = false;
		}
	}

	function getResultClass(type?: string) {
		const map: Record<string, string> = {
			open: 'border-green-500 bg-green-500/15 text-green-500',
			cone: 'border-blue-500 bg-blue-500/15 text-blue-500',
			full_cone: 'border-blue-500 bg-blue-500/15 text-blue-500',
			addr_rest_cone: 'border-fuchsia-500 bg-fuchsia-500/15 text-fuchsia-500',
			port_rest_cone: 'border-amber-500 bg-amber-500/15 text-amber-500',
			symmetric: 'border-red-500 bg-red-500/15 text-red-500',
			blocked: 'border-slate-500 bg-slate-500/15 text-slate-500'
		};
		return map[type || ''] || 'border-border bg-muted text-foreground';
	}
</script>

<svelte:head>
	<title>NAT 类型检测 - 二叉树树</title>
	<meta name="description" content="高级 NAT 类型及连通性探测" />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-12 space-y-6">
	<Card>
		<CardHeader>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle class="flex items-center gap-2 text-2xl">
					<Icon icon="mdi:lan-check" class="size-6 text-primary" />
					NAT 类型检测
				</CardTitle>
				<PageViews pathname="/nat/" class="text-sm text-muted-foreground" />
			</div>
		</CardHeader>
		<CardContent class="space-y-2">
			<p class="text-sm text-muted-foreground leading-relaxed">
				通过基于 Twin-Server 架构进行 STUN 检测，结合 WebRTC 测试您的网络环境是否属于全锥形、受限锥形、对称型等，以便分析
				P2P 连通条件。
			</p>
			<p class="text-sm text-muted-foreground">
				后端开源：
				<a
					href="https://github.com/afoim/webrtc_check_nat"
					target="_blank"
					rel="noopener noreferrer"
					class="text-primary hover:underline"
				>
					afoim/webrtc_check_nat
				</a>
			</p>
		</CardContent>
	</Card>

	<Card>
		<CardContent class="flex flex-col items-center gap-4 py-6">
			<p class="text-sm text-muted-foreground text-center">
				点击下方按钮开始检测。将会通过 WebRTC 在您的网络建立 STUN 探测通道来分析 NAT 环境。
			</p>
			<Button size="lg" onclick={startTest} disabled={isTesting} class="px-8">
				{#if isTesting}
					<Icon icon="mdi:loading" class="size-5 animate-spin" />
					检测中...
				{:else}
					<Icon icon="mdi:play-circle" class="size-5" />
					开始检测
				{/if}
			</Button>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle class="text-base">执行日志</CardTitle>
		</CardHeader>
		<CardContent>
			<div
				bind:this={logsContainer}
				class="h-48 overflow-y-auto rounded-md border bg-muted/30 p-3 font-mono text-xs space-y-1 text-muted-foreground"
			>
				{#each logs as l}
					<div class="break-all">{l}</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	{#if resultData}
		<div
			class="rounded-2xl border-2 p-6 text-center {getResultClass(resultData.type)}"
		>
			<h2 class="mb-3 text-xl font-bold md:text-2xl">{resultData.label}</h2>
			<p class="text-sm opacity-90 md:text-base">{resultData.details}</p>
		</div>
	{/if}
</div>
