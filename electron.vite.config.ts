import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          mainWindow: resolve(__dirname, 'src/preload/index.ts'),
          musicview: resolve(__dirname, 'src/preload/ytmview/preload.ts'),
          ytview: resolve(__dirname, 'src/preload/yt/preload.ts'),
        },
      }
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    plugins: [svelte()]
  }
})
