import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()]
	},
	preload: {
		build: {
			rollupOptions: {
				input: {
					main: resolve(__dirname, 'src/preload/main/index.ts'),
					music: resolve(__dirname, 'src/preload/music/index.ts'),
					yt: resolve(__dirname, 'src/preload/yt/index.ts')
				}
			}
		},
		plugins: [externalizeDepsPlugin()]
	},
	renderer: {
		plugins: [svelte()]
	}
});
