<script lang="ts">
    import { createEventDispatcher } from 'svelte'
  
    export let icon;
  
    const dispatch = createEventDispatcher()
  
    function handleClick() {
      dispatch('click')
    }
  </script>
  
  <button on:click={handleClick} class="p-2 hover:bg-zinc-200 hover:dark:bg-neutral-700 rounded transition-colors text-zinc-700 dark:text-zinc-300 duration-200 no-drag"> 
      <svelte:component this={icon} size={16}/>
  </button>
  