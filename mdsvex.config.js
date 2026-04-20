import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import rehypePrettyCode from 'rehype-pretty-code';

console.log('[mdsvex] 开始加载配置...');

const prettyCodeOptions = {
	theme: {
		light: 'github-light',
		dark: 'github-dark'
	},
	onVisitLine(node) {
		console.log('[rehype-pretty-code] 访问代码行:', node);
		if (node.children.length === 0) {
			node.children = [{ type: 'text', value: ' ' }];
		}
	},
	onVisitHighlightedLine(node) {
		console.log('[rehype-pretty-code] 访问高亮行:', node);
		node.properties.className = ['line--highlighted'];
	},
	onVisitHighlightedWord(node) {
		console.log('[rehype-pretty-code] 访问高亮词:', node);
		node.properties.className = ['word--highlighted'];
	}
};

console.log('[mdsvex] rehype-pretty-code 配置:', prettyCodeOptions);

const config = defineConfig({
	extensions: ['.md'],
	smartypants: {
		dashes: 'oldschool'
	},
	remarkPlugins: [],
	rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]]
});

console.log('[mdsvex] 配置加载完成');

export default config;
