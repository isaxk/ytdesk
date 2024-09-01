<script lang="ts">
  import { onMount } from "svelte";
  import MenuBar from "./views/MenuBar.svelte";
  import { activeView, musicDataStore, showBookmarks, theme } from "./lib/stores";
  import Settings from "./views/Settings.svelte";
  import MiniPlayer from "./views/MiniPlayer.svelte";
  import type { musicData, playerState } from "./lib/types";
  import Spinner from "./components/ui/Spinner.svelte";
  import Bookmarks from "./views/Bookmarks.svelte";

  onMount(async () => {
    theme.set(await window.api.getTheme());
    window.api.onUpdateTheme((e: "light" | "dark") => {
      theme.set(e);
    });
  });

  let active = 0;
  let tabs = [];

  window.api.onUpdateTabs((data) => {
    tabs = data.tabs;
    active = data.currentTab;
  });

  window.api.onVideoDataChange((e: musicData) => {
    musicDataStore.update((s) => ({ ...s, data: e }));
  });

  window.api.onVideoProgressChange((e: number) => {
    musicDataStore.update((s) => ({ ...s, progress: e }));
  });

  window.api.onVideoStateChange((e: playerState) => {
    musicDataStore.update((s) => ({ ...s, state: e }));
  });

  window.api.onVolumeChange((e: number) => {
    musicDataStore.update((s) => ({ ...s, volume: e }));
  });
</script>

{#if $theme !== null}
  <div class="{$theme} contents">
    <main
      class="flex h-screen flex-col bg-white transition-all dark:bg-[#121212] text-black dark:text-white"
    >
      {#if $activeView === "topbar"}
        <main
          class="flex h-screen flex-col bg-white transition-all dark:bg-[#121212] "
        >
          <MenuBar {active} {tabs} />
          <div class="flex h-full flex-grow">
            <div class="flex flex-grow items-center justify-center">
              <Spinner />
            </div>
            {#if $showBookmarks}
              <Bookmarks {tabs} {active} />
            {/if}
          </div>
        </main>
      {:else if $activeView === "settings"}
        <Settings />
      {:else if $activeView === "miniplayer"}
        <MiniPlayer />
      {/if}
    </main>
  </div>
{/if}

<style lang="postcss">
  :global(body) {
    background-color: #121212;
    overflow: hidden;
  }
</style>
