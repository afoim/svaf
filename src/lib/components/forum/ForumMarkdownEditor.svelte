<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { type ForumUploadType, uploadFile } from '$lib/forum/api/auth';
	import { ForumApiError } from '$lib/forum/types/api';
	import {
		POST_IMAGE_MAX_BYTES,
		compressPostImage,
		isPostImageWithinLimit
	} from '$lib/forum/utils/image-compression';

	type EditorMode = 'post' | 'comment' | 'reply';

	const toolbarMap: Record<EditorMode, string[][]> = {
		post: [
			['heading', 'bold', 'italic', 'strike'],
			['hr', 'quote'],
			['ul', 'ol', 'task'],
			['table', 'link', 'image'],
			['code', 'codeblock']
		],
		comment: [
			['bold', 'italic', 'strike'],
			['quote', 'ul', 'ol'],
			['link', 'image', 'code', 'codeblock']
		],
		reply: [
			['bold', 'italic'],
			['quote', 'link', 'image'],
			['code', 'codeblock']
		]
	};

	const MAX_UPLOAD_SIZE_LABEL = `${Math.round(POST_IMAGE_MAX_BYTES / 1024)}KB`;

	interface Props {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		submitting?: boolean;
		mode?: EditorMode;
		uploadType?: Exclude<ForumUploadType, 'avatar'>;
		uploadPostId?: string;
		minHeight?: number;
		shellClass?: string;
		autoFocus?: boolean;
		onsubmit?: () => void;
		onescape?: () => void;
		onchange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		placeholder = '支持 Markdown',
		disabled = false,
		submitting = false,
		mode = 'comment',
		uploadType,
		uploadPostId = '',
		minHeight = 220,
		shellClass = '',
		autoFocus = false,
		onsubmit,
		onescape,
		onchange
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let editor: any = null;
	let internalValue = value;
	let keydownCleanup: (() => void) | null = null;
	let uploadStatus = $state('');
	let uploading = $state(false);

	function syncValue(nextValue: string) {
		internalValue = nextValue;
		if (value !== nextValue) {
			value = nextValue;
			onchange?.(nextValue);
		}
	}

	async function updatePreviewClasses() {
		const previewEl = containerEl?.querySelector('.toastui-editor-contents');
		if (!previewEl) return;
		previewEl.classList.add(
			'custom-md',
			'prose',
			'prose-invert',
			'!max-w-none',
			'break-words',
			'text-white/75'
		);
		previewEl.classList.remove('forum-comment-md');
		const { highlightCodeBlocksIn } = await import('$lib/utils/highlight');
		void highlightCodeBlocksIn(previewEl as HTMLElement);
	}

	function setDisabledState(nextDisabled: boolean) {
		const root = containerEl?.querySelector('.toastui-editor-defaultUI');
		root?.classList.toggle('is-disabled', nextDisabled);
		if (editor && typeof editor.setDisabled === 'function') {
			editor.setDisabled(nextDisabled);
		}
	}

	function normalizeUploadError(error: unknown) {
		if (error instanceof ForumApiError && error.status === 401) {
			return '请先登录论坛后再上传图片。';
		}
		if (error instanceof Error && error.message) return error.message;
		return '图片上传失败，请稍后重试。';
	}

	async function handleImageUpload(
		blob: Blob | File,
		callback: (url: string, text?: string) => void
	) {
		if (!uploadType) {
			uploadStatus = '当前编辑器未启用图片上传。';
			return;
		}
		if (!(blob instanceof File)) {
			uploadStatus = '仅支持上传图片文件。';
			return;
		}
		if (!blob.type.startsWith('image/')) {
			uploadStatus = '仅支持上传图片文件。';
			return;
		}

		uploading = true;
		uploadStatus = '正在压缩图片...';
		let uploadFileTarget: File = blob;

		try {
			try {
				uploadFileTarget = await compressPostImage(blob);
			} catch {
				if (!isPostImageWithinLimit(blob)) {
					throw new Error(`图片压缩失败，且原图仍超过 ${MAX_UPLOAD_SIZE_LABEL} 限制。`);
				}
				uploadFileTarget = blob;
			}

			if (!isPostImageWithinLimit(uploadFileTarget)) {
				uploadStatus = `压缩后图片仍超过 ${MAX_UPLOAD_SIZE_LABEL}，请更换更小的图片。`;
				return;
			}

			uploadStatus =
				uploadFileTarget === blob ? '正在上传图片...' : '正在上传压缩后的图片...';
			const url = await uploadFile({
				file: uploadFileTarget,
				type: uploadType,
				postId: uploadPostId || undefined
			});
			if (!url) throw new Error('上传成功，但未获取到图片地址。');
			callback(url, uploadFileTarget.name || blob.name || 'image');
			uploadStatus = '图片已上传并插入。';
			syncValue(editor?.getMarkdown() || '');
		} catch (error) {
			uploadStatus = normalizeUploadError(error);
		} finally {
			uploading = false;
		}
	}

	onMount(() => {
		let disposed = false;

		void (async () => {
			// @ts-expect-error - @toast-ui/editor lacks proper exports map for types
			const { default: ToastEditor } = await import('@toast-ui/editor');
			await import('@toast-ui/editor/dist/toastui-editor.css');
			if (disposed || !containerEl) return;

			editor = new ToastEditor({
				el: containerEl,
				height: `${minHeight}px`,
				autofocus: autoFocus,
				initialEditType: 'markdown',
				previewStyle: 'vertical',
				initialValue: value,
				placeholder,
				theme: 'dark',
				usageStatistics: false,
				hideModeSwitch: true,
				toolbarItems: toolbarMap[mode],
				useCommandShortcut: true,
				hooks: {
					addImageBlobHook: async (
						blob: Blob | File,
						callback: (url: string, text?: string) => void
					) => {
						await handleImageUpload(blob, callback);
						return false;
					}
				}
			});

			editor.on('change', () => {
				syncValue(editor?.getMarkdown() || '');
				void updatePreviewClasses();
			});

			const keydownHandler = (event: KeyboardEvent) => {
				if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
					event.preventDefault();
					onsubmit?.();
					return;
				}
				if (event.key === 'Escape') onescape?.();
			};

			containerEl.addEventListener('keydown', keydownHandler);
			keydownCleanup = () => containerEl?.removeEventListener('keydown', keydownHandler);

			await updatePreviewClasses();
			setDisabledState(disabled || submitting);
		})();

		return () => {
			disposed = true;
		};
	});

	onDestroy(() => {
		keydownCleanup?.();
		keydownCleanup = null;
		editor?.destroy();
		editor = null;
	});

	$effect(() => {
		if (editor && value !== internalValue) {
			internalValue = value;
			editor.setMarkdown(value, false);
			void updatePreviewClasses();
		}
	});

	$effect(() => {
		if (editor && placeholder) editor.setPlaceholder(placeholder);
	});

	$effect(() => {
		if (editor) setDisabledState(disabled || submitting);
	});
</script>

<div class={`forum-editor-shell ${shellClass}`.trim()}>
	<div bind:this={containerEl}></div>
	{#if uploading || uploadStatus}
		<p class="mt-2 text-xs text-muted-foreground">
			{uploadStatus}
		</p>
	{/if}
</div>

<style>
	:global(.forum-editor-shell .toastui-editor-defaultUI) {
		zoom: 0.9;
		border-radius: 0.75rem;
		overflow: hidden;
		border: 1px solid var(--border);
		background: var(--card);
	}

	:global(.forum-editor-shell .toastui-editor-toolbar) {
		background: var(--muted);
		border-bottom: 1px solid var(--border);
	}

	:global(.forum-editor-shell .toastui-editor-toolbar-icons) {
		border-radius: 0.5rem;
		opacity: 0.9;
	}

	:global(.forum-editor-shell .toastui-editor-main),
	:global(.forum-editor-shell .toastui-editor-md-container),
	:global(.forum-editor-shell .toastui-editor-ww-container),
	:global(.forum-editor-shell .toastui-editor-md-preview) {
		background: var(--background);
	}

	:global(.forum-editor-shell .toastui-editor-md-preview) {
		border-left: 1px solid var(--border);
	}

	:global(.forum-editor-shell .toastui-editor-md-tab-container) {
		display: none;
	}

	:global(.forum-editor-shell .toastui-editor-contents) {
		font-family: inherit;
		color: var(--foreground);
	}

	:global(.forum-editor-shell .toastui-editor-md-preview .toastui-editor-contents),
	:global(.forum-editor-shell .toastui-editor-md-container .toastui-editor-contents) {
		padding: 1rem 1.25rem;
	}

	:global(.forum-editor-shell .toastui-editor-main-container) {
		min-height: inherit;
	}

	:global(.forum-editor-shell .toastui-editor-defaultUI.is-disabled) {
		opacity: 0.65;
		pointer-events: none;
	}
</style>
