import { writable } from 'svelte/store';

/**
 * 文章 TOC 浮动入口的共享状态。
 * - PostToc 在有标题时 setAvailable(true)，卸载时关闭；点击抽屉内链接等会设置 open=false
 * - BackToTop 根据 available 决定是否渲染 TOC 按钮，点击时 toggle()
 */
interface TocFloatingState {
	available: boolean;
	open: boolean;
}

function createTocFloatingStore() {
	const { subscribe, update, set } = writable<TocFloatingState>({
		available: false,
		open: false
	});

	return {
		subscribe,
		setAvailable(available: boolean) {
			update((s) => ({ ...s, available, open: available ? s.open : false }));
		},
		setOpen(open: boolean) {
			update((s) => ({ ...s, open }));
		},
		toggle() {
			update((s) => ({ ...s, open: !s.open }));
		},
		reset() {
			set({ available: false, open: false });
		}
	};
}

export const tocFloating = createTocFloatingStore();
