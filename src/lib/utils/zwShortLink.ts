// 零宽字符短链工具
// ZWSP=0, ZWNJ=1，前缀 ZWSP+ZWNJ+ZWSP+ZWNJ 作为魔术标识
export const ZW_CHARS = ['\u200B', '\u200C'] as const;
export const ZW_PREFIX = '\u200B\u200C\u200B\u200C';

export function encodeUrl(url: string): string {
	const bytes = new TextEncoder().encode(url);
	let out = '';
	for (const byte of bytes) {
		const binary = byte.toString(2).padStart(8, '0');
		for (const bit of binary) {
			out += ZW_CHARS[Number(bit)];
		}
	}
	return out;
}

export function decodeUrl(encoded: string): string {
	const seq = encoded.split('').filter((c) => (ZW_CHARS as readonly string[]).includes(c));
	let binary = '';
	for (const c of seq) {
		binary += (ZW_CHARS as readonly string[]).indexOf(c).toString();
	}
	const bytes: number[] = [];
	for (let i = 0; i < binary.length; i += 8) {
		const chunk = binary.slice(i, i + 8);
		if (chunk.length === 8) bytes.push(parseInt(chunk, 2));
	}
	return new TextDecoder().decode(new Uint8Array(bytes));
}

/**
 * 检查 pathname（已 decodeURIComponent 后）是否为零宽短链。
 * 返回解码出的目标 URL，否则返回 null。
 */
export function tryDecodeShortLink(rawPathname: string): string | null {
	let path: string;
	try {
		path = decodeURIComponent(rawPathname);
	} catch {
		return null;
	}
	// 去掉开头的斜杠
	const stripped = path.replace(/^\/+/, '');
	if (!stripped.startsWith(ZW_PREFIX)) return null;
	const encoded = stripped.slice(ZW_PREFIX.length);
	if (!encoded) return null;
	try {
		const url = decodeUrl(encoded);
		// 安全校验
		const parsed = new URL(url);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
		return url;
	} catch {
		return null;
	}
}

export function visualizeZwChars(encoded: string): string {
	return encoded.replace(/\u200B/g, '○').replace(/\u200C/g, '●');
}
