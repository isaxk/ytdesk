<script lang="ts">
  import Bouncer from "$lib/Bouncer.svelte";
  import ThemeMarquee from "$lib/ThemeMarquee.svelte";
  import { inview } from "svelte-inview";
  import { fly } from "svelte/transition";

  let video: HTMLVideoElement;

  let sectionVisibility = [false, false, false];
</script>

<header
  class="relative flex h-screen items-center justify-center overflow-x-hidden overflow-y-hidden bg-gradient-to-tr from-slate-950 to-emerald-950 text-white"
>
  <div class="w-screen-2xl absolute z-0 m-auto flex flex-col items-end gap-32">
    <img
      src="/ythero.png"
      alt=""
      class="max-w-[960px] -translate-x-80 sm:-translate-x-40"
    />
    <img
      src="/musichero.png"
      alt=""
      class="max-w-[960px] translate-x-80 sm:translate-x-40"
    />
  </div>

  <div class="z-20 -mt-6 text-center">
    <h1 class="text-6xl font-extrabold">YT Desk</h1>
    <h3 class="mb-4 mt-2 text-lg font-medium text-zinc-200">
      Youtube & YT Music supercharged
    </h3>
    <a
      href="https://github.com/isaxk/ytdesk/releases/latest"
      class="rounded bg-white/30 px-6 py-2.5 text-white">Download</a
    >
  </div>
  <div
    class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent via-neutral-900/95 via-80% to-neutral-900"
  ></div>
  <Bouncer />
</header>

<section
  class="m-auto mt-40 box-content flex h-[240px] max-w-screen-sm flex-col justify-center gap-10 px-10 sm:mt-20 sm:flex-row sm:gap-20"
>
  {#if sectionVisibility[0]}
    <!-- svelte-ignore a11y-media-has-caption -->
    <div
      class="flex items-center justify-center sm:w-60 sm:justify-start"
      in:fly={{ x: -100, duration: 400, delay: 50 }}
    >
      <img src="/miniplayer.png" alt="IGOR Miniplayer" class="h-60 w-60" />
    </div>
    <div
      class="flex-grow justify-end text-center sm:flex sm:text-left"
      in:fly={{ x: 100, duration: 400, delay: 100 }}
    >
      <div>
        <div class="mb-4 text-4xl font-bold">Miniplayer</div>
        <ul class="ml-4 w-full list-disc text-lg">
          <li>Simple and clean</li>
          <li>Quick access to frequent controls</li>
          <li>Always on top (optional)</li>
        </ul>
      </div>
    </div>
  {/if}
</section>
<div
  use:inview
  on:inview_enter={() => {
    sectionVisibility[0] = true;
  }}
></div>

<section
  class="m-auto mb-10 mt-80 box-content flex h-[240px] max-w-screen-sm flex-col-reverse justify-center gap-10 px-10 sm:mt-32 sm:flex-row sm:gap-20"
>
  <!-- svelte-ignore a11y-media-has-caption -->

  {#if sectionVisibility[1]}
    <div
      class="pt-10 text-center text-lg sm:w-1/2 sm:text-left"
      in:fly={{ x: -100, duration: 400, delay: 50 }}
    >
      <div class="mb-4 text-4xl font-bold">Discord Presence</div>
      Share what your listening to/watching with your discord friends.
    </div>
    <div
      class="flex items-center justify-center sm:w-60 sm:justify-end"
      in:fly={{ x: 100, duration: 400, delay: 100 }}
    >
      <img
        src="/discord.png"
        alt="IGOR Miniplayer"
        class="h-60 w-60 scale-125"
      />
    </div>
  {/if}
</section>
<div
  use:inview
  on:inview_enter={() => {
    sectionVisibility[1] = true;
  }}
></div>

<div class="mt-40 h-96 sm:mt-0">
  <ThemeMarquee visible={sectionVisibility[2]} />
</div>
<div
  use:inview
  on:inview_enter={() => {
    sectionVisibility[2] = true;
  }}
></div>

<style lang="postcss">
  :global(body) {
    @apply overflow-x-hidden bg-neutral-900 text-zinc-200;
  }
</style>
