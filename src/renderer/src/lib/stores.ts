import { writable } from "svelte/store";
import type { musicStore } from "./types";

export const activeView = writable("topbar");
export const musicDataStore = writable<musicStore | { data: null }>({
  data: null,
});
export const theme = writable<"light" | "dark" | null>(null);
