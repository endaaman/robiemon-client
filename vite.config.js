import fs from 'fs';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';


const KEY_FILE = './certs/localhost-key.pem'
const CERT_FILE = './certs/localhost.pem'
const ssl = fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	server: {
		proxy: {
			'/static': 'http://localhost:3000',
			'/api': 'http://localhost:3000',
		},
    ...(ssl && {
      https: {
        key: fs.readFileSync(KEY_FILE),
        cert: fs.readFileSync(CERT_FILE),
      },
    })
	},
})
