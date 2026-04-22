export function emitSuccessToast(title: string, description: string, silent = true): void {
	if (!silent && typeof window !== 'undefined') {
		alert(`${title}\n\n${description}`);
	}
}

export function emitErrorToast(title: string, description: string): void {
	if (typeof window !== 'undefined') {
		alert(`${title}\n\n${description}`);
	}
}

export const emitInfoToast = emitSuccessToast;
export const emitWarningToast = emitErrorToast;
