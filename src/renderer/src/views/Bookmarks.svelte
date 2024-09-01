<script>
  // @ts-nocheck

  import Bookmark from "../components/bookmarks/Bookmark.svelte";
  import IconButton from "../components/ui/IconButton.svelte";
  import { Plus, X } from "lucide-svelte";
  import {
    activeView,
    createBookmarksStore,
    showBookmarks,
  } from "../lib/stores";
  import { fly, slide } from "svelte/transition";

  export let tabs = [];
  export let active;

  const bookmarks = createBookmarksStore();

  $: console.log($bookmarks);
</script>

<div
  class="flex h-full w-[300px] flex-col border-l py-4 pl-4 pr-1 dark:border-neutral-700"
  in:fly={{ x: 100, duration: 200 }}
>
  <div class="flex items-center pb-3 pr-3">
    <h1 class="flex-grow text-3xl font-semibold">Bookmarks</h1>
    <IconButton
      icon={X}
      on:click={() => {
        showBookmarks.set(false);
        window.api.closeSidebar();
      }}
    />
  </div>
  <div class="mb-10 flex min-h-0 flex-grow flex-col pr-3">
    {#if tabs && tabs.length > 0 && tabs[active].type === "yt"}
      <button
        transition:slide={{ duration: 150 }}
        on:click={() => {
          bookmarks.add(tabs[active].title, tabs[active].url);
        }}
        class="flex h-10 w-full items-center justify-center gap-1 rounded bg-zinc-200 px-4 py-2 text-sm transition-all hover:bg-zinc-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        ><Plus />Add current page</button
      >
    {/if}
    <div
      class="-mr-3 flex min-h-0 flex-grow flex-col gap-2 overflow-y-scroll pb-10 pr-3 pt-2"
    >
      {#each $bookmarks.toReversed() as tab, i (tab.url)}
        <Bookmark
          title={tab.title}
          url={tab.url}
          date={tab.date}
          {i}
          store={bookmarks}
        />
      {/each}
    </div>
  </div>
</div>
