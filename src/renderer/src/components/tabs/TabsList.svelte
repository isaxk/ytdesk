<script lang="ts">
  import { flip } from 'svelte/animate'
  import Tab from './Tab.svelte'

  export let tabs
  export let active: number
</script>

<div class="ml-2 flex h-full min-w-0 flex-grow items-center gap-2 overflow-x-scroll p-1 text-sm">
  {#each tabs as tab, i (tab.id)}
    <div
      animate:flip={{ duration: 200 }}
      class="h-full {tab.type === 'music' || tab.type === 'studio' ? 'w-9' : active === i ? 'w-1/3' : 'w-52'}"
    >
      <Tab {tab} {i} active={active === i} />
    </div>
  {/each}
</div>
