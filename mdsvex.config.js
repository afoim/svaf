import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import rehypePrettyCode from 'rehype-pretty-code';

const prettyCodeOptions = {
	theme: {
		light: 'github-light',
		dark: 'github-dark'
	},
	onVisitLine(node) {
		if (node.children.length === 0) {
			node.children = [{ type: 'text', value: ' ' }];
		}
	},
	onVisitHighlightedLine(node) {
		node.properties.className = ['line--highlighted'];
	},
	onVisitHighlightedWord(node) {
		node.properties.className = ['word--highlighted'];
	}
};

const config = defineConfig({
	extensions: ['.md'],
	smartypants: {
		dashes: 'oldschool'
	},
	remarkPlugins: [],
	rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
	highlight: false
});

export default config;
