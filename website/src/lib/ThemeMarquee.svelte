<script lang="ts">
  import Marqueeck from "@arisbh/marqueeck";
  import { fade, fly } from "svelte/transition";

  let images = ["theme1.png", "theme2.png", "theme3.png"];

  export let visible = false;
</script>

<section
  class="relative m-auto flex h-96 max-w-screen-md items-center"
  in:fade={{ duration: 200, delay: 0 }}
>
  <Marqueeck>
    {#each images as image}
      <img
        src={image}
        alt="Theme"
        class="w-96 transition-all duration-500 {visible ? 'opacity-100' : 'opacity-0'}"
      />
    {/each}
  </Marqueeck>
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="">
      {#if visible}
        <div class="flex w-80 flex-col text-6xl font-bold text-white">
          <div
            class="shadow-black [text-shadow:_2px_2px_10px_rgb(0_0_0_/_80%)]"
            in:fly={{ duration: 400, x: 50, delay: 250 }}
          >
            Custom
          </div>
          <div
            in:fly={{ duration: 400, x: -50, delay: 350 }}
            class="w-full text-right shadow-black [text-shadow:_2px_2px_10px_rgb(0_0_0_/_80%)]"
          >
            Theming
          </div>
        </div>
      {/if}
    </div>
  </div>
  <div
    class="absolute -left-6 bottom-0 top-0 w-24 bg-gradient-to-l from-transparent via-transparent via-20% to-neutral-900"
  ></div>
  <div
    class="absolute -right-6 bottom-0 top-0 w-24 bg-gradient-to-r from-transparent via-transparent via-20% to-neutral-900"
  ></div>
</section>
