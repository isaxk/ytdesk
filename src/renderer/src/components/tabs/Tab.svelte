<script lang="ts">
  export let tab: { title: string; url: string; i: number; type: string }
  export let i: number
  export let active = false
  import { X } from 'lucide-svelte'
  import { fade, fly } from 'svelte/transition'
  import MusicIcon from '../../assets/music.png'
  import YoutubeIcon from '../../assets/youtube.png'
  import StudioIcon from '../../assets/studio.png'

  function handleClick() {
    window.api.switchTab(i)
  }

  function handleClose() {
    window.api.closeTab(i)
  }
</script>

<div
  in:fly={{ x: 50, duration: 200 }}
  out:fly={{ x: -50, duration: 200 }}
  class="{active
    ? 'w-full bg-white drop-shadow dark:bg-neutral-700'
    : 'w-full text-zinc-400 hover:text-current dark:text-zinc-500'} no-drag no-drag m-0 flex h-full min-w-0 items-center overflow-x-hidden text-ellipsis text-nowrap rounded-md px-2 text-left transition-all duration-300
    {tab.type === 'music' || tab.type === 'studio' ? 'px-0' : ''}
    "
>
  <button class="overflox-x-hidden relative h-full w-full text-left" on:click={handleClick}>
    <div
      class="absolute bottom-0 left-0 flex h-full w-full items-center {tab.type === 'music' || tab.type === 'studio'
        ? 'justify-center'
        : ''}"
    >
      {#if active && (tab.type !== 'music' && tab.type !== 'studio')}
        <img src={YoutubeIcon} alt="Youtube Music" class="mr-1 h-2.5" />
        {tab.url.replace('https://www.youtube.com', '')}
      {:else if tab.type === 'music'}
        <img src={MusicIcon} alt="Youtube Music" class="h-4 w-4" />
      {:else if tab.type === 'studio'}
        <img src={StudioIcon} alt="Youtube Studio" class="h-4 w-4" />
      {:else}
        <img src={YoutubeIcon} alt="Youtube" class="mr-1 h-2.5" />
        {tab.title}
      {/if}
    </div>
  </button>

  {#if active && tab.type !== 'music' && tab.type !== 'studio'}
    <button in:fade on:click={handleClose} class="p-1">
      <X size={14} />
    </button>
  {/if}
</div>
