import { defineMDSveXConfig as defineConfig } from 'mdsvex';
import remarkAvifRewrite from '../../../vite-plugins/remark-avif-rewrite.js';
import remarkGithubAlerts from '../../../vite-plugins/remark-github-alerts.js';
import rehypeExternalLinks from '../../../vite-plugins/rehype-external-links.js';

const config = defineConfig({
	extensions: ['.md'],
	smartypants: {
		dashes: 'oldschool'
	},
	remarkPlugins: [remarkGithubAlerts, remarkAvifRewrite],
	rehypePlugins: [rehypeExternalLinks]
});

export default config;
