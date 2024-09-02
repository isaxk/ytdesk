<script lang="ts">
  import { Trash } from "lucide-svelte";
  import IconButton from "../ui/IconButton.svelte";
  import { fly, slide } from "svelte/transition";
  import moment from "moment";
  import { onDestroy, onMount } from "svelte";
  import { Tooltip } from "bits-ui";

  function YouTubeGetID(url) {
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return url[2] !== undefined ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
  }

  export let title;
  export let url;
  export let date;
  export let store;
  // @ts-ignore
  export let i:number;

  $: {
    title = title.replace(" - YouTube", "");
    let length = title.length;
    title = title.substring(0, 35);
    title = title + (length > 34 ? "..." : "");
  }

  let display = "";
  let interval;

  function refreshTime() {
    display = moment(date).fromNow();
  }

  onMount(() => {
    refreshTime();
    interval = setInterval(refreshTime, 5000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  $: id = YouTubeGetID(url);
</script>

<div
  class="w-full items-center gap-1 rounded border text-left dark:border-neutral-800"
  transition:slide={{ duration: 200 }}
>
  {#if id.length === 11}
    <img
      src="https://img.youtube.com/vi/{id}/0.jpg"
      alt=""
      class="h-14 w-full rounded-t object-cover object-center"
    />
  {/if}
  <div class="flex min-w-0">
    <button
      class="flex w-full min-w-0 flex-grow flex-col px-4 py-2 text-left"
      on:click={() => {
        window.api.openBookmark(url);
      }}
    >
      <div
        class="text-md mb-1 w-full min-w-0 overflow-x-hidden text-ellipsis font-bold leading-5"
      >
        {title}
      </div>
      <div
        class="w-full min-w-0 overflow-x-hidden text-ellipsis text-nowrap text-xs font-extralight text-zinc-300"
      >
        {url.replace("https://www.youtube.com/", "/")}
      </div>
      <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger class="text-left text-xs font-medium">
          Saved {display}
        </Tooltip.Trigger>
        <Tooltip.Content
          transition={fly}
          transitionConfig={{ y: 8, duration: 150 }}
          sideOffset={8}
          side="bottom"
          align="center"
        >
          <div class="bg-neutral-900">
            <Tooltip.Arrow
              class="rounded-[2px] border-l border-t border-neutral-700"
            />
          </div>
          <div
            class="rounded-md border border-neutral-700 bg-neutral-900 p-2 text-xs text-white"
          >
            {moment(date).format("HH:MM - Do MMM YYYY")}
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </button>
    <div class="flex w-10 items-center">
      <div>
        <IconButton icon={Trash} on:click={() => store.remove(url)} />
      </div>
    </div>
  </div>
</div>