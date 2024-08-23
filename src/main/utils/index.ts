import { BrowserWindow } from "electron"

export const debounce = (fn: Function, time = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), time)
  }
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function loadVite(win: BrowserWindow, path: string): void {
	console.log(import.meta.env.MAIN_VITE_ELECTRON_RENDERER_URL + path);
	win.loadURL(import.meta.env.MAIN_VITE_ELECTRON_RENDERER_URL + path).catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => {
			loadVite(win, path);
		}, 200);
	});
}