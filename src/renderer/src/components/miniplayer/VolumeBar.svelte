<script>
  import { Slider } from "bits-ui";

  export let value;

  let localVal = value;
</script>

{#if value !== null}
  <Slider.Root
    value={[localVal]}
    min={0}
    max={100}
    onValueChange={(e) => window.api.musicRemote("setVolume", e[0])}
    let:thumbs
    class="relative ml-20 mr-2 flex w-full touch-none select-none items-center"
  >
    <span
      class="bg-dark-10 relative h-2 w-full grow overflow-hidden rounded-full"
    >
      <Slider.Range class="absolute h-full bg-zinc-200" />
    </span>
    {#each thumbs as thumb}
      <Slider.Thumb
        {thumb}
        class="border-border-input hover:border-dark-40 focus-visible:ring-foreground active:scale-98 dark:bg-foreground dark:shadow-card block size-[10px]  cursor-pointer rounded-full border bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      />
    {/each}
  </Slider.Root>
{/if}
