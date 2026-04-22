import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import postImages from './vite-plugins/post-images.js';
import redirects from './vite-plugins/redirects.js';

export default defineConfig({
	plugins: [sveltekit(), redirects(), postImages()],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./src/lib/components/__tests__/setup.ts']
	}
});
