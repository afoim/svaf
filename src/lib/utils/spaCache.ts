/**
 * SPA 缓存工具
 * 在用户会话期间缓存 API 响应，避免重复请求
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

class SPACache {
	private cache = new Map<string, CacheEntry<any>>();

	/**
	 * 获取缓存数据，如果不存在或过期则执行 fetcher
	 * @param key 缓存键
	 * @param fetcher 数据获取函数
	 * @param ttl 缓存有效期（毫秒），默认为整个会话期间有效
	 */
	async get<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
		const cached = this.cache.get(key);
		const now = Date.now();

		// 如果缓存存在且未过期，返回缓存数据
		if (cached && (!ttl || now - cached.timestamp < ttl)) {
			return cached.data as T;
		}

		// 否则执行 fetcher 获取新数据
		const data = await fetcher();
		this.cache.set(key, { data, timestamp: now });
		return data;
	}

	/**
	 * 手动设置缓存
	 */
	set<T>(key: string, data: T): void {
		this.cache.set(key, { data, timestamp: Date.now() });
	}

	/**
	 * 清除指定缓存
	 */
	clear(key: string): void {
		this.cache.delete(key);
	}

	/**
	 * 清除所有缓存
	 */
	clearAll(): void {
		this.cache.clear();
	}

	/**
	 * 检查缓存是否存在
	 */
	has(key: string): boolean {
		return this.cache.has(key);
	}
}

// 导出单例
export const spaCache = new SPACache();
