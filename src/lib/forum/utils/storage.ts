export function readLocalStorage<T>(key: string, fallback: T): T {
	if (typeof localStorage === 'undefined') return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

export function writeLocalStorage<T>(key: string, value: T): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// ignore
	}
}

export function removeLocalStorage(key: string): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.removeItem(key);
	} catch {
		// ignore
	}
}
