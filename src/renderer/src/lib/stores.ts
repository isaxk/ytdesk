import { writable } from "svelte/store";
import type { musicStore } from "./types";

export const activeView = writable("topbar");
export const showBookmarks = writable(false);
export const musicDataStore = writable<musicStore | null>({
  data: null,
  volume: 50,
  progress: 0,
  state: -1,
});
export const theme = writable<"light" | "dark" | null>(null);

export function createBookmarksStore(): {
  subscribe: any;
  add: Function;
  remove: Function;
} {
  const { subscribe, set, update } = writable([]);

  if (localStorage.tabs) {
    set(JSON.parse(localStorage.tabs));
  }

  subscribe((tabs) => {
    localStorage.tabs = JSON.stringify(tabs);
  });

  return {
    subscribe,
    add: (title, url) => {
      update((tabs) => {
        if (tabs.some((tab) => tab.url === url)) {
          return tabs;
        } else {
          return [...tabs, { title, url, date: Date.now() }];
        }
      });
    },
    remove: (url: string) => {
      update((tabs) => {
        return tabs.filter((tab) => {
          return tab.url !== url;
        });
      });
    },
  };
}
