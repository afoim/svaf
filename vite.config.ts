import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { postImagesPlugin } from './vite-plugins/post-images.js';
import redirects from './vite-plugins/redirects.js';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), redirects(), postImagesPlugin()],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./src/lib/components/__tests__/setup.ts']
	}
});
