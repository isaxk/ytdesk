import { writable } from "svelte/store";
import type { musicStore } from "./types";

export const activeView = writable("topbar");
export const musicDataStore = writable<musicStore | null>(null);
export const theme = writable<"light" | "dark" | null>(null);
