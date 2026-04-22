import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import remarkAvifRewrite from '../../../vite-plugins/remark-avif-rewrite.js';

const config = defineConfig({
	extensions: ['.md'],
	smartypants: {
		dashes: 'oldschool'
	},
	remarkPlugins: [remarkAvifRewrite],
	rehypePlugins: []
});

export default config;
