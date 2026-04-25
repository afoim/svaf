import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
	id: string;
	type: ToastType;
	title: string;
	description: string;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	let counter = 0;

	function add(type: ToastType, title: string, description: string) {
		const id = `toast-${++counter}-${Date.now()}`;
		update((msgs) => [...msgs, { id, type, title, description }]);
		const delay = type === 'error' ? 6000 : 4000;
		setTimeout(() => {
			update((msgs) => msgs.filter((m) => m.id !== id));
		}, delay);
	}

	function dismiss(id: string) {
		update((msgs) => msgs.filter((m) => m.id !== id));
	}

	return { subscribe, add, dismiss };
}

export const forumToast = createToastStore();
