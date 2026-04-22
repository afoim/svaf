/**
 * mdsvex remark 插件：在生产构建时，将文章中引用的栅格图片 URL
 * （.png/.jpg/.jpeg/.webp）改写为 .avif，与 vite-plugin-post-images
 * 在 build 阶段输出的 AVIF 文件保持一致。
 *
 * 同时改写 frontmatter.image 字段。
 */

const CONVERTIBLE_RE = /\.(png|jpe?g|webp)(?=$|[?#])/i;

function rewriteUrl(url) {
  if (typeof url !== 'string') return url;
  // 仅改写本地相对路径下的 img/ 资源；外链/绝对 URL 不动
  if (/^(https?:)?\/\//i.test(url)) return url;
  if (!CONVERTIBLE_RE.test(url)) return url;
  return url.replace(CONVERTIBLE_RE, '.avif');
}

function visit(node, type, fn) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const c of node) visit(c, type, fn);
    return;
  }
  if (node.type === type) fn(node);
  if (node.children) visit(node.children, type, fn);
}

export default function remarkAvifRewrite() {
  return (tree, file) => {
    if (process.env.NODE_ENV !== 'production') return;

    // 改写 markdown 图片节点
    visit(tree, 'image', (node) => {
      node.url = rewriteUrl(node.url);
    });

    // 改写 HTML 中的 <img src="..."> 与 <source srcset="...">
    visit(tree, 'html', (node) => {
      if (typeof node.value !== 'string') return;
      node.value = node.value
        .replace(/(<img[^>]+src=["'])([^"']+)(["'])/gi, (_, p1, src, p3) => p1 + rewriteUrl(src) + p3)
        .replace(/(<source[^>]+srcset=["'])([^"']+)(["'])/gi, (_, p1, src, p3) => p1 + rewriteUrl(src) + p3);
    });

    // 改写 frontmatter.image
    const fm = file?.data?.fm;
    if (fm && typeof fm.image === 'string') {
      fm.image = rewriteUrl(fm.image);
    }
  };
}
