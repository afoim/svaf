import { forumToast } from '../stores/toast';

export function emitSuccessToast(title: string, description: string): void {
	forumToast.add('success', title, description);
}

export function emitErrorToast(title: string, description: string): void {
	forumToast.add('error', title, description);
}

export function emitInfoToast(title: string, description: string): void {
	forumToast.add('info', title, description);
}

export const emitWarningToast = emitErrorToast;
