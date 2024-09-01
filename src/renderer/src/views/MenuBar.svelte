<script lang="ts">
  import TabsList from "../components/menubar/TabBar.svelte";
  import IconButton from "../components/ui/IconButton.svelte";
  import {
    Bookmark,
    CircleArrowOutDownRight,
    Plus,
    Settings,
  } from "lucide-svelte";
  import WindowControl from "../components/ui/WindowControl.svelte";
  import Navigation from "../components/menubar/Navigation.svelte";
  import MacSpace from "../components/ui/MacSpace.svelte";
  import { activeView, musicDataStore, showBookmarks } from "../lib/stores";

  export let active;
  export let tabs;

  $: miniplayerEnabled = $musicDataStore.data !== null;

  musicDataStore.subscribe((e) => {
    console.log("musicDataStore", e);
  });
</script>

<div class="h-10">
  <header
    class="flex h-10 select-none items-center bg-zinc-50 pr-2 transition-colors dark:bg-neutral-800 dark:text-white"
    style="-webkit-app-region: drag"
  >
    <MacSpace />
    <Navigation />
    <TabsList {tabs} {active} />
    <div class="flex">
      <IconButton icon={Plus} on:click={() => window.api.newTab()} />
      <IconButton icon={Bookmark} on:click={() => {
        showBookmarks.set(true);
        window.api.openSidebar();
      }} />
      <IconButton
        disabled={!miniplayerEnabled}
        icon={CircleArrowOutDownRight}
        on:click={() => {
          activeView.set("miniplayer");
          window.api.openMiniplayer();
        }}
      />
      <IconButton
        icon={Settings}
        on:click={() => {
          activeView.set("settings");
          window.api.openSettings();
        }}
      />
    </div>
    <WindowControl />
  </header>
</div>
