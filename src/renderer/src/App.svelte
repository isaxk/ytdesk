<script lang="ts">
  import { onMount } from "svelte";
  import MenuBar from "./views/MenuBar.svelte";
  import { activeView, musicDataStore, theme } from "./lib/stores";
  import Settings from "./views/Settings.svelte";
  import MiniPlayer from "./views/MiniPlayer.svelte";
  import type { musicData, playerState } from "./lib/types";

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
      class="h-screen bg-white text-black transition-all dark:bg-[#121212] dark:text-white"
    >
      {#if $activeView === "topbar"}
        <MenuBar {active} {tabs} />
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
