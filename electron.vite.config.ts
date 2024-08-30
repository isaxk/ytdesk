import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "./src/preload/index.ts"),
          yt: resolve(__dirname, "./src/preload/yt.ts"),
          music: resolve(__dirname, "./src/preload/music.ts"),
        },
      },
    },
  },
  renderer: {
    plugins: [svelte()],
  },
});
