import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { postImagesPlugin } from './vite-plugin-post-images.js';
import redirectsPlugin from './vite-plugin-redirects.js';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), postImagesPlugin(), redirectsPlugin()]
});
