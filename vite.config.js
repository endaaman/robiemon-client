import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
		proxy: {
			'/static': 'http://localhost:3000',
			'/api': 'http://localhost:3000',
		},
	},
  ssr: {
    external: ['@jsuites/cropper']
  }
});
