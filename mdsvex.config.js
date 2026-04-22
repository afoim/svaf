import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import remarkAvifRewrite from './remark-avif-rewrite.js';

const config = defineConfig({
	extensions: ['.md'],
	smartypants: {
		dashes: 'oldschool'
	},
	remarkPlugins: [remarkAvifRewrite],
	rehypePlugins: []
});

export default config;
