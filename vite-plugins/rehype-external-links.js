import { visit } from 'unist-util-visit';

/**
 * rehype 插件：给外链添加 target="_blank" 和 rel="noopener noreferrer"
 */
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
