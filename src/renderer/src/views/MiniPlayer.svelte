<script lang="ts">
  import { onMount } from "svelte";
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
  import { fade, fly, scale } from "svelte/transition";
  import ProgressBar from "../components/miniplayer/Progress.svelte";
  import { activeView } from "../lib/stores";
  import WindowControl from "../components/ui/WindowControl.svelte";
  import Spinner from "../components/ui/Spinner.svelte";
  let videoData: any = null;
  let progress: number = 0;
  let state: number = 0;
  let volume: number = 50;

  window.api.onVideoDataChange((e) => {
    videoData = e;
    console.log(e);
  });

  window.api.onVideoProgressChange((e) => {
    progress = e;
  });

  window.api.onVideoStateChange((e) => {
    state = e;
  });

  window.api.onVolumeChange((e) => {
    console.log(e);
    volume = e;
  });

  onMount(async () => {
    videoData = await window.api.getVideoData();
    state = await window.api.getVideoState();
    volume = await window.api.getVolume();
  });

  window.addEventListener("keydown", (e) => {
    console.log(e);
    if (e.key === " ") {
      window.api.musicRemote("playPause", 0);
    }
  });

  $: progressPC = videoData ? (progress / videoData.lengthSeconds) * 100 : 0;

  function handleSlide(e) {
    if (progress == e || (progress - e < 10 && progress - e > -10)) return;
    progress = e;
    window.api.musicRemote("seekTo", e);
  }

  $: console.log(videoData);
</script>

<main
  class="drag relative h-screen w-full bg-cover bg-center transition-[background-image] duration-500"
  out:fade={{ duration: 300 }}
>
  <img
    src={videoData
      ? videoData.thumbnail.thumbnails[
          Math.min(2, videoData.thumbnail.thumbnails.length - 2)
        ].url
      : ""}
    alt=""
	in:scale={{start: 1.1, duration: 1000, delay: 0, opacity: 0}}
    class="absolute top-0 left-0 w-full h-full object-cover"
  />
  <div
    class="drag absolute inset-0 flex flex-col bg-gradient-to-b from-black/30 via-black/80 via-70% to-black/90"
  >
    <div class="flex-grow"></div>

    {#if videoData}
      <div class="m-auto flex w-full max-w-[300px] flex-col">
        <div
          class="flex w-full flex-col overflow-x-hidden text-ellipsis px-4 text-center text-zinc-300"
		  in:scale={{start: 1.5, duration:300, delay: 300}}
        >
          <div
            class="w-full min-w-0 overflow-x-hidden text-ellipsis text-nowrap text-center text-2xl font-bold"
          >
            {videoData.title}
          </div>
          <div
            class="w-full min-w-0 overflow-x-hidden text-ellipsis text-nowrap text-center text-sm"
          >
            {videoData.author}
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
            {#if state !== 2}
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
                <VolumeSlider value={volume} />
              </Tooltip.Content>
            </Tooltip.Root>
          </div>
        </div>

        <div class="no-drag group relative h-2 w-full">
          {#if progress !== null}
            <ProgressBar
              vidLength={videoData.lengthSeconds}
              {progress}
              onValueChange={handleSlide}
            />
          {/if}
        </div>
      </div>
    {:else}
      <div
        class="w-full flex-grow flex items-center justify-center"
      >
        <Spinner />
        </div>
    {/if}
  </div>
</main>
<div class="fixed right-0 top-0">
  <WindowControl closeOnly />
</div>
