import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
  use: [
		[ "sass", { includePaths: ["./themes", "./node_modules"] }, ],
	]
};

export default config;
