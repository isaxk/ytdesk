<script lang="ts">
  import TabsList from "../components/menubar/TabBar.svelte";
  import IconButton from "../components/ui/IconButton.svelte";
  import Spinner from "../components/ui/Spinner.svelte";
  import { CircleArrowOutDownRight, Plus, Settings } from "lucide-svelte";
  import WindowControl from "../components/ui/WindowControl.svelte";
  import Navigation from "../components/menubar/Navigation.svelte";
  import MacSpace from "../components/ui/MacSpace.svelte";
  import { activeView } from "../lib/stores";
  import { onMount } from "svelte";

  export let active;
  export let tabs;

  let miniplayerEnabled = false;

  onMount(async () => {
    miniplayerEnabled = (await window.api.getVideoData()) !== null;
  });

  window.api.onVideoDataChange((e) => {
    miniplayerEnabled = e !== null;
  });
</script>

<main class="flex h-screen flex-col bg-white transition-all dark:bg-[#121212]">
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

  <div class="flex flex-grow items-center justify-center">
    <Spinner />
  </div>
</main>
