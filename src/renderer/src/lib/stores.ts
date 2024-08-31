import { writable } from "svelte/store";
import type { musicStore } from "./types";

export const activeView = writable("topbar");
export const musicDataStore = writable<musicStore | null>({
    data: null,
    volume: 50,
    progress: 0,
    state: -1,
});
export const theme = writable<"light" | "dark" | null>(null);
