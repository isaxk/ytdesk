<script lang="ts">
  import { Select } from "bits-ui";
  import { Check } from "lucide-svelte";
  import { createEventDispatcher } from "svelte";
  import { fly } from "svelte/transition";
  import { theme } from "../../lib/stores";

  export let value;
  export let options: { label: string; value: string }[] = [];

  const dispatch = createEventDispatcher();

  function handleSelect(e) {
    dispatch("select", e);
  }
</script>

<Select.Root
  items={options}
  selected={options.filter((o) => o.value == value)[0]}
  onSelectedChange={handleSelect}
>
  <Select.Trigger
    class="w-52 h-9 rounded border bg-zinc-50 px-2 py-1 text-left dark:border-neutral-700 dark:bg-neutral-900"
  >
    <Select.Value placeholder="Choose..." />
  </Select.Trigger>

  <Select.Content
    transition={fly}
    transitionConfig={{ y: -10, duration: 200 }}
    class="mt-2 flex flex-col rounded-md drop-shadow-md {$theme === 'light'
      ? 'bg-zinc-50 text-black'
      : 'bg-neutral-800 text-white'}"
  >
    {#each options as option}
      <Select.Item
        value={option.value}
        class="flex items-center rounded-md px-3 py-2 data-[highlighted]:dark:bg-neutral-700"
      >
        <div class="flex-grow">{option.label}</div>

        <Select.ItemIndicator class="ml-auto" asChild={false}>
          <Check size={16} />
        </Select.ItemIndicator>
      </Select.Item>
    {/each}
  </Select.Content>
</Select.Root>
