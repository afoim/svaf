<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Dialog from '$lib/components/ui/dialog';
	import Icon from '@iconify/svelte';

	interface ConsentPreferences {
		necessary: boolean;
		functional: boolean;
		analytics: boolean;
		marketing: boolean;
	}

	let showBanner = $state(false);
	let showSettings = $state(false);
	
	let preferences = $state<ConsentPreferences>({
		necessary: true,
		functional: false,
		analytics: false,
		marketing: false
	});

	const STORAGE_KEY = 'cookie-consent-preferences';
	const CONSENT_VERSION = '1.0';

	onMount(() => {
		loadPreferences();
		
		// 监听打开设置的事件
		const handleOpenSettings = (e: Event) => {
			e.preventDefault();
			showSettings = true;
		};
		
		document.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (target.id === 'open_preferences_center' || target.closest('#open_preferences_center')) {
				handleOpenSettings(e);
			}
		});
	});

	function loadPreferences() {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const data = JSON.parse(stored);
				if (data.version === CONSENT_VERSION) {
					preferences = data.preferences;
					applyConsent();
					return;
				}
			}
		} catch (e) {
			console.error('Failed to load cookie preferences:', e);
		}
		
		// 如果没有保存的偏好，显示横幅
		showBanner = true;
	}

	function savePreferences() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({
				version: CONSENT_VERSION,
				preferences,
				timestamp: Date.now()
			}));
		} catch (e) {
			console.error('Failed to save cookie preferences:', e);
		}
	}

	function acceptAll() {
		preferences = {
			necessary: true,
			functional: true,
			analytics: true,
			marketing: true
		};
		savePreferences();
		applyConsent();
		showBanner = false;
		showSettings = false;
	}

	function acceptNecessary() {
		preferences = {
			necessary: true,
			functional: false,
			analytics: false,
			marketing: false
		};
		savePreferences();
		applyConsent();
		showBanner = false;
		showSettings = false;
	}

	function saveCustomPreferences() {
		preferences.necessary = true; // 必要 Cookie 始终启用
		savePreferences();
		applyConsent();
		showBanner = false;
		showSettings = false;
	}

	function applyConsent() {
		// 触发自定义事件，通知 Analytics 组件
		window.dispatchEvent(new CustomEvent('cookie-consent-updated', {
			detail: preferences
		}));
	}
</script>

<!-- Cookie 横幅 -->
{#if showBanner}
	<div class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
		<div class="fixed bottom-0 left-0 right-0 p-4 md:p-6">
			<Card class="mx-auto max-w-3xl">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Icon icon="mdi:cookie" class="h-5 w-5" />
						Cookie 使用说明
					</CardTitle>
					<CardDescription>
						我们使用 Cookie 来改善您的浏览体验、提供个性化内容和分析网站流量。
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						<p class="text-sm text-muted-foreground">
							点击"接受全部"即表示您同意我们使用所有 Cookie。您也可以点击"自定义设置"来选择您希望启用的 Cookie 类型。
							查看我们的 <a href="/posts/privacy-policy/" class="text-primary underline">隐私政策</a> 了解更多信息。
						</p>
						
						<div class="flex flex-wrap gap-3">
							<Button onclick={acceptAll}>
								<Icon icon="mdi:check-all" class="mr-2 h-4 w-4" />
								接受全部
							</Button>
							<Button variant="outline" onclick={acceptNecessary}>
								仅必要 Cookie
							</Button>
							<Button variant="outline" onclick={() => showSettings = true}>
								<Icon icon="mdi:cog" class="mr-2 h-4 w-4" />
								自定义设置
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
{/if}

<!-- Cookie 设置对话框 -->
<Dialog.Root bind:open={showSettings}>
	<Dialog.Content class="max-w-2xl max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Cookie 偏好设置</Dialog.Title>
			<Dialog.Description>
				选择您希望启用的 Cookie 类型。必要 Cookie 无法禁用，因为它们对网站的正常运行至关重要。
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="space-y-6 py-4">
			<!-- 必要 Cookie -->
			<div class="space-y-3">
				<div class="flex items-start gap-3">
					<Checkbox checked={true} disabled={true} class="mt-1" />
					<div class="flex-1">
						<h3 class="font-semibold">必要 Cookie</h3>
						<p class="text-sm text-muted-foreground mt-1 mb-2">
							这些 Cookie 对于网站的基本功能是必需的，无法禁用。
						</p>
						<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>Umami Analytics - 网站统计</li>
							<li>Cloudflare Insights - 性能监控</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- 功能性 Cookie -->
			<div class="space-y-3">
				<div class="flex items-start gap-3">
					<Checkbox bind:checked={preferences.functional} class="mt-1" />
					<div class="flex-1">
						<h3 class="font-semibold">功能性 Cookie</h3>
						<p class="text-sm text-muted-foreground mt-1 mb-2">
							这些 Cookie 用于增强网站功能和个性化体验。
						</p>
						<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>Giscus - 评论系统</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- 分析 Cookie -->
			<div class="space-y-3">
				<div class="flex items-start gap-3">
					<Checkbox bind:checked={preferences.analytics} class="mt-1" />
					<div class="flex-1">
						<h3 class="font-semibold">分析 Cookie</h3>
						<p class="text-sm text-muted-foreground mt-1 mb-2">
							这些 Cookie 帮助我们了解访问者如何使用网站，以便改进用户体验。
						</p>
						<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>百度统计 - 访问分析</li>
							<li>Google Analytics - 用户行为分析</li>
							<li>Microsoft Clarity - 用户体验分析</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- 营销 Cookie -->
			<div class="space-y-3">
				<div class="flex items-start gap-3">
					<Checkbox bind:checked={preferences.marketing} class="mt-1" />
					<div class="flex-1">
						<h3 class="font-semibold">营销 Cookie</h3>
						<p class="text-sm text-muted-foreground mt-1 mb-2">
							这些 Cookie 用于跟踪访问者并显示相关广告。
						</p>
						<ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
							<li>Google AdSense - 广告投放</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={acceptNecessary}>
				仅必要 Cookie
			</Button>
			<Button onclick={saveCustomPreferences}>
				保存设置
			</Button>
			<Button onclick={acceptAll}>
				接受全部
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
