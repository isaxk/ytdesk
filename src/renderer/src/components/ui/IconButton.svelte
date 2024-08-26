<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let icon;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    if (disabled) return;
    dispatch("click");
  }
</script>

<button
  on:click={handleClick}
  class="no-drag rounded p-2 transition-colors duration-200 {disabled
    ? 'text-zinc-500 dark:text-zinc-500 cursor-not-allowed'
    : 'text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 hover:dark:bg-neutral-700'}"
>
  <svelte:component this={icon} size={16} />
</button>
