<script lang="ts">
  import { Minus, Square, X } from 'lucide-svelte'
  import IconButton from './IconButton.svelte'

  export let closeOnly = false
</script>

{#if window.api.platform === 'win32'}
  <div class="flex border-l border-zinc-700 {closeOnly ? 'pl-1' : 'pl-2'} ml-2">
    {#if !closeOnly}
      <IconButton icon={Minus} on:click={() => window.api.windowAction('minimize')} />
      <IconButton icon={Square} on:click={() => window.api.windowAction('maximize')} />
    {/if}
    <IconButton icon={X} on:click={() => window.api.windowAction('close')} />
  </div>
{/if}
