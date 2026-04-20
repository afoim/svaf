/**
 * 将 markdown 中的相对路径转换为绝对路径
 * @param slug 文章 slug
 * @param path 相对路径（如 img/xxx.webp）
 */
export function resolvePostAssetPath(slug: string, path: string): string {
	// 如果已经是绝对路径或外部链接，直接返回
	if (path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://')) {
		return path;
	}
	
	// 转换为绝对路径
	return `/posts/${slug}/${path}`;
}
