/**
 * rehype 插件：给外链添加 target="_blank" 和 rel="noopener noreferrer"
 */

function visit(node, type, fn) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const c of node) visit(c, type, fn);
    return;
  }
  if (node.type === type) fn(node);
  if (node.children) visit(node.children, type, fn);
}

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && node.properties && node.properties.href) {
        const href = node.properties.href;
        // 判断是否为外链（http/https 开头）
        if (/^https?:\/\//i.test(href)) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
    });
  };
}
