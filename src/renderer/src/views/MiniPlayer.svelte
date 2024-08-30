<script lang="ts">
  import { Tooltip } from "bits-ui";
  import {
    CircleArrowOutUpLeft,
    Pause,
    Play,
    SkipBack,
    SkipForward,
    Volume2,
  } from "lucide-svelte";
  import VolumeSlider from "../components/miniplayer/VolumeBar.svelte";
  import { fly, scale } from "svelte/transition";
  import ProgressBar from "../components/miniplayer/Progress.svelte";
  import { activeView, musicDataStore } from "../lib/stores";
  import WindowControl from "../components/ui/WindowControl.svelte";
  import Spinner from "../components/ui/Spinner.svelte";
  import { playerState } from "../lib/types";

  $: progress = $musicDataStore ? $musicDataStore.progress : 0;
  $: progressPC = $musicDataStore
    ? ($musicDataStore.progress /
        parseInt($musicDataStore.data.lengthSeconds)) *
      100
    : 0;

  function handleSlide(e) {
    if (progress == e || (progress - e < 10 && progress - e > -10)) return;
    progress = e;
    window.api.musicRemote("seekTo", e);
  }
</script>

<main
  class="drag relative h-screen w-full bg-cover bg-center transition-[background-image] duration-500"
  in:scale={{ start: 1.1, duration: 1000, delay: 0, opacity: 0 }}
>
  {#if $musicDataStore}
    <img
      src={$musicDataStore.data.thumbnail.thumbnails[
        Math.min(2, $musicDataStore.data.thumbnail.thumbnails.length - 2)
      ].url}
      alt="Album Art"
      class="absolute left-0 top-0 h-full w-full object-cover"
    />
    <div
      class="drag absolute inset-0 flex flex-col bg-gradient-to-b from-black/30 via-black/80 via-70% to-black/90"
    >
      <div class="flex-grow"></div>

      <div class="m-auto flex w-full max-w-[300px] flex-col">
        <div
          class="flex w-full flex-col overflow-x-hidden text-ellipsis px-4 text-center text-zinc-300"
        >
          <div
            class="w-full min-w-0 overflow-x-hidden text-ellipsis text-nowrap text-center text-2xl font-bold"
          >
            {$musicDataStore.data.title}
          </div>
          <div
            class="w-full min-w-0 overflow-x-hidden text-ellipsis text-nowrap text-center text-sm"
          >
            {$musicDataStore.data.author}
          </div>
          <div class="no-drag mt-1 flex w-full justify-around text-zinc-400">
            <button
              class="p-3 transition-all hover:text-zinc-50"
              on:click={() => {
                window.api.closeMiniplayer();
                activeView.set("topbar");
              }}
            >
              <CircleArrowOutUpLeft size={18} />
            </button>
            {#if progressPC > 0.5}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote("seekTo", 0)}
              >
                <SkipBack size={18} />
              </button>
            {:else}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote("previous", 0)}
              >
                <SkipBack size={18} />
              </button>
            {/if}
            {#if $musicDataStore.state !== playerState.Paused}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote("playPause", 0)}
              >
                <Pause size={18} />
              </button>
            {:else}
              <button
                class="p-3 transition-all hover:text-zinc-50"
                on:click={() => window.api.musicRemote("playPause", 0)}
              >
                <Play size={18} />
              </button>
            {/if}
            <button
              class="p-3 transition-all hover:text-zinc-50"
              on:click={() => window.api.musicRemote("next", 0)}
            >
              <SkipForward size={18} />
            </button>
            <Tooltip.Root openDelay={0}>
              <Tooltip.Trigger class="p-3 transition-all hover:text-zinc-50">
                <Volume2 size={18} />
              </Tooltip.Trigger>
              <Tooltip.Content
                class="flex h-8 w-full items-center bg-black/0 pl-5 backdrop-blur-2xl"
                side="left"
                transition={fly}
                transitionConfig={{ x: 20, duration: 200 }}
              >
                <VolumeSlider value={$musicDataStore.volume} />
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        </div>

        <div class="no-drag group relative h-2 w-full">
          {#if progress !== null}
            <ProgressBar
              vidLength={$musicDataStore.data.lengthSeconds}
              {progress}
              onValueChange={handleSlide}
            />
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="flex w-full flex-grow items-center justify-center">
      <Spinner />
    </div>
  {/if}
</main>
<div class="fixed right-0 top-0">
  <WindowControl closeOnly />
</div>
