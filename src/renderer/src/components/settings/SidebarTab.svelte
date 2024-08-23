<script lang="ts">
    export let value: string
    export let label: string
    export let icon: typeof SvelteComponent<any>
    import { Tabs } from 'bits-ui'
    import type { SvelteComponent } from 'svelte'
  </script>
  
  <Tabs.Trigger {value} class="text-left p-4 transition-[background-color] flex rounded items-center text-zinc-400 gap-2 w-full hover:text-current data-[state=active]:bg-zinc-200 data-[state=active]:dark:bg-neutral-700 data-[state=active]:text-current">
      <div class="">
          <svelte:component this={icon} size={18}/>
      </div>
      <div class="text-left">
          {label}
      </div>
  </Tabs.Trigger>
  