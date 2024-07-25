import type { ElectronAPI } from "@electron-toolkit/preload";
import { writable } from "svelte/store";

export function createFullscreenStore(electron: ElectronAPI) {
    const { subscribe, set } = writable<boolean>(false);

    electron.ipcRenderer.on("enter-full-screen", () => {
        set(true);
    })

    electron.ipcRenderer.on("leave-full-screen", () => {
        set(false);
    })

    return {
        subscribe
    }
}

export function createUrlDisplayStore(electron: ElectronAPI) {
    const { subscribe, set } = writable<string>("/");

    electron.ipcRenderer.on("navigate", (_, url:string) => {
        set(url
            .replace("https://www.youtube.com", "")
            .replace("https://music.youtube.com", ""))
            
    })

    return { subscribe };
}