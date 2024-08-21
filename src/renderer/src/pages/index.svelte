<script lang="ts">
  import Router from 'svelte-spa-router'
  import '../assets/app.css'
  import { routes } from '../router'
  import { onMount } from 'svelte'

  let theme: string|null = null;

  onMount(async () => {
    theme = await window.api.getTheme()

    window.api.onUpdateTheme((e: string) => {
      theme = e
      console.log(e)
    })
  })
</script>

{#if theme}
  <div class="{theme} contents">
    <main class="h-screen bg-white transition-all dark:bg-[#121212] dark:text-white">
      <Router {routes} />
    </main>
  </div>
{/if}

<style lang="postcss">
  :global(body) {
    background-color: #121212;
  }
</style>
