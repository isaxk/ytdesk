<script lang="ts">
  import { Slider, Tooltip } from 'bits-ui'
  import { CircleArrowOutUpLeft, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-svelte'
  import VolumeSlider from '../components/VolumeSlider.svelte'
  import { fly } from 'svelte/transition'

  export let videoData
  export let progress
  export let state
  export let volume

  $: progressPC = videoData ? (progress / videoData.lengthSeconds) * 100 : 0

  function handleSlide(e) {
    if (progress == e || (progress - e < 10 && progress - e > -10)) return
    progress = e
    window.api.musicRemote('seekTo', e)
  }
</script>

<main
  class="drag relative h-screen w-full bg-cover bg-center transition-[background-image] duration-500"
  style="background-image: url('{videoData
    ? videoData.thumbnail.thumbnails[videoData.thumbnail.thumbnails.length - 1].url
    : ''}');"
>
  <div
    class="drag absolute inset-0 flex flex-col bg-gradient-to-b from-black/20 via-black/90 via-70% to-black/90"
  >
    <div class="flex-grow"></div>
    {#if videoData}
      <div class="flex w-full flex-col">
        <div
          class="no-drag flex w-full flex-col overflow-x-hidden text-ellipsis px-4 text-center text-zinc-300"
        >
          <div
            class="w-full min-w-0 overflow-x-hidden text-ellipsis text-nowrap text-center text-2xl font-bold"
          >
            {videoData.title}
          </div>
          <div class="text-sm">{videoData.author}</div>
          <div class="mt-1 flex w-full justify-around text-zinc-400">
            <button
              class="p-3 transition-all hover:text-zinc-50"
              on:click={() => window.api.closeMiniplayer()}
            >
              <CircleArrowOutUpLeft size={18} />
            </button>
            {#if progressPC > 0.5}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote('seekTo', 0)}
              >
                <SkipBack size={18} />
              </button>
            {:else}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote('previous', 0)}
              >
                <SkipBack size={18} />
              </button>
            {/if}
            {#if state !== 2}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote('playPause', 0)}
              >
                <Pause size={18} />
              </button>
            {:else}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote('playPause', 0)}
              >
                <Play size={18} />
              </button>
            {/if}
            <button
              class="p-3 transition-all hover:text-zinc-50"
              on:click={() => window.api.musicRemote('next', 0)}
            >
              <SkipForward size={18} />
            </button>
            <Tooltip.Root openDelay={0}>
              <Tooltip.Trigger class="p-3 transition-all hover:text-zinc-50">
                <Volume2 size={18} />
              </Tooltip.Trigger>
              <Tooltip.Content
                class="flex h-8 w-full pl-5 items-center bg-black/0 backdrop-blur-2xl"
                side="left"
                transition={fly}
                transitionConfig={{ x: 20, duration: 200 }}
              >
                <VolumeSlider value={volume} />
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        </div>

        <div class="no-drag group relative h-2 w-full">
          {#if progress !== null}
            <Slider.Root
              let:thumbs
              min={0}
              max={videoData.lengthSeconds}
              step={1}
              onValueChange={handleSlide}
              class="absolute bottom-0 h-1 w-full transition-all hover:h-2"
              value={[progress]}
            >
              <Slider.Range class="h-full bg-white/70 transition-all" />
              {#each thumbs as thumb}
                <Slider.Thumb {thumb} />
              {/each}
            </Slider.Root>
          {/if}
        </div>
      </div>
    {:else}
      <div class="w-full flex-grow px-3 text-center text-xl font-bold text-zinc-300">
        No music playing right now.
        <div class="text-sm font-light">(Miniplayer only supports YT Music playback)</div>
        <!-- svelte-ignore a11y-invalid-attribute -->
        <a
          href="javascript:void()"
          on:click={() => window.api.closeMiniplayer()}
          class="no-drag text-sm font-medium underline">Close</a
        >
      </div>
    {/if}
  </div>
</main>
