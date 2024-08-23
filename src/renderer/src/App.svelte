<script lang="ts">
  import { onMount } from 'svelte'
  import MenuBar from './views/MenuBar.svelte'
  import {activeView} from "./lib/stores"
  import Settings from './views/Settings.svelte'
  import MiniPlayer from './views/MiniPlayer.svelte'

  let theme: string | null = null

  onMount(async () => {
    theme = await window.api.getTheme()
    console.log(theme)
    window.api.onUpdateTheme((e: string) => {
      theme = e
      console.log(e)
    })
  })

  let active = 0;
  let tabs = [];

  window.api.onUpdateTabs((data) => {
    tabs = data.tabs;
    active = data.currentTab;
  });
</script>

{#if theme!==null}
  <div class="{theme} contents">
    <main class="h-screen bg-white text-black transition-all dark:bg-[#121212] dark:text-white">
      {#if $activeView==="topbar"}
      <MenuBar {active} {tabs}/>
      {:else if $activeView==="settings"}
      <Settings />
      {:else if $activeView==="miniplayer"}
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
