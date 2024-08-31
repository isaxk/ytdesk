<script lang="ts">
  export let value: string;
  export let label: string;
  export let icon: typeof SvelteComponent<any>;
  import { Tabs } from "bits-ui";
  import type { SvelteComponent } from "svelte";
</script>

<Tabs.Trigger
  {value}
  class="flex w-full items-center gap-2 rounded p-4 text-left text-neutral-600 transition-[background-color] hover:text-current data-[state=active]:bg-zinc-200 data-[state=active]:text-current dark:text-zinc-300 data-[state=active]:dark:bg-neutral-700 {value ===
    'about' ?? 'self-end mt-auto'}"
>
  <div class="">
    <svelte:component this={icon} size={18} />
  </div>
  <div class="text-left">
    {label}
  </div>
</Tabs.Trigger>
