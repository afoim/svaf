import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import remarkAvifRewrite from '../../../vite-plugins/remark-avif-rewrite.js';
import rehypeExternalLinks from '../../../vite-plugins/rehype-external-links.js';

const config = defineConfig({
	extensions: ['.md'],
	smartypants: {
		dashes: 'oldschool'
	},
	remarkPlugins: [remarkAvifRewrite],
	rehypePlugins: [rehypeExternalLinks]
});

export default config;
