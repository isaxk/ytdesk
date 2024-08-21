<script lang="ts">
  import TabsList from '../components/tabs/TabsList.svelte'
  import IconButton from '../components/IconButton.svelte'
  import Spinner from '../components/Spinner.svelte'
  import { CircleArrowOutDownRight, Plus, Settings } from 'lucide-svelte'
  import WindowControl from '../components/WindowControl.svelte'
  import Navigation from '../components/Navigation.svelte'
  import MacSpace from '../components/MacSpace.svelte'

  let active = 0
  let tabs = []

  window.api.onUpdateTabs((data) => {
    tabs = data.tabs
    active = data.currentTab
  })
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
        <IconButton icon={CircleArrowOutDownRight} on:click={() => window.api.openMiniplayer()} />
        <IconButton icon={Settings} on:click={() => window.api.openSettings()} />
      </div>
      <WindowControl />
    </header>
  </div>

  <div class="flex flex-grow items-center justify-center">
    <Spinner />
  </div>
</main>
