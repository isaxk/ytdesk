<script lang="ts">
  import Select from "./Select.svelte";
  import { Switch, Tabs } from "bits-ui";
  import { onMount } from "svelte";
  import KeybindInput from "./KeybindInput.svelte";
  import { slide } from "svelte/transition";

  export let label: string;
  export let key: string;
  export let type: string;
  export let restart = false;
  export let options: { label: string; value: string }[] = [];

  let value: any = null;

  $: console.log(value);

  onMount(async () => {
    if (type === "css") {
      value = JSON.parse(await window.api.getConfig(key));
    } else {
      value = await window.api.getConfig(key);
    }

    console.log(value);
  });

  function handleSelect(e) {
    window.api.setConfig(key, e.value);
  }

  function handleSwitch(e) {
    console.log(e);
    value = e;
    window.api.setConfig(key, e);
  }

  function handleKeybind(e) {
    console.log(e);
    window.api.setConfig(key, e.detail);
  }
</script>

<div class="flex h-max w-full items-center">
  <div class="flex-grow">
    {label}
    {#if restart}
      <div class="text-light text-xs text-neutral-700 dark:text-zinc-300">
        Requires Restart
      </div>
    {/if}
  </div>
  {#if value !== null}
    {#if type === "select"}
      <Select on:select={(e) => handleSelect(e.detail)} {options} {value} />
    {:else if type === "switch"}
      <Switch.Root
        id={key}
        onCheckedChange={handleSwitch}
        checked={value}
        class="h-8 w-14 rounded-full bg-zinc-100 p-1 transition-all data-[state=checked]:bg-zinc-200 dark:bg-neutral-800 data-[state=checked]:dark:bg-neutral-700"
      >
        <Switch.Thumb
          class="pointer-events-none block size-[24px] shrink-0 rounded-full bg-zinc-300 transition-all data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-zinc-400 dark:bg-neutral-600 data-[state=checked]:dark:bg-neutral-500"
        />
      </Switch.Root>
    {:else if type === "keybind"}
      <KeybindInput {value} on:change={handleKeybind} />
    {:else if type === "css"}
      <Switch.Root
        id={key}
        bind:checked={value.enabled}
        onCheckedChange={(e) => {
          window.api.setConfig(
            key,
            JSON.stringify({
              ...value,
              enabled: e,
            }),
          );
        }}
        class="h-8 w-14 rounded-full bg-zinc-100 p-1 transition-all data-[state=checked]:bg-zinc-200 dark:bg-neutral-800 data-[state=checked]:dark:bg-neutral-700"
      >
        <Switch.Thumb
          class="pointer-events-none block size-[24px] shrink-0 rounded-full bg-zinc-300 transition-all data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-zinc-400 dark:bg-neutral-600 data-[state=checked]:dark:bg-neutral-500"
        />
      </Switch.Root>
    {/if}
  {/if}
</div>
{#if type === "css"}
  {#if value !== null && value.enabled}
    <div transition:slide={{ duration: 150 }}>
      <Tabs.Root
        asChild
        bind:value={value.type}
        onValueChange={() => {
          setTimeout(() => {
            window.api.setConfig(
              key,
              JSON.stringify({
                ...value,
              }),
            );
          }, 400);
        }}
      >
        <div class="pb-4 rounded-md border dark:border-neutral-600">
          <Tabs.List
            class="flex w-full justify-stretch rounded bg-zinc-200 p-1 text-center dark:bg-neutral-800"
          >
            <Tabs.Trigger
              value="url"
              class="w-full rounded p-1 data-[state=active]:bg-white data-[state=active]:font-medium data-[state=active]:dark:bg-neutral-700"
              >URL</Tabs.Trigger
            >
            <Tabs.Trigger
              value="editor"
              class="w-full rounded p-1 data-[state=active]:bg-white data-[state=active]:font-medium data-[state=active]:dark:bg-neutral-700"
              >Editor <span class="text-xs font-light">(advanced)</span></Tabs.Trigger
            >
          </Tabs.List>
          <div
            class="{value.type == 'url'
              ? 'h-10'
              : 'h-40'} transition-all duration-300"
          >
            <Tabs.Content value="url">
              <input
                type="text"
                placeholder="Paste the url to your css file."
                bind:value={value.url}
                class="w-full bg-transparent p-2 text-zinc-300 outline-none focus:text-current"
                on:change={() => {
                  window.api.setConfig(
                    key,
                    JSON.stringify({
                      ...value,
                    }),
                  );
                }}
              />
            </Tabs.Content>
            <Tabs.Content value="editor" class="h-full">
              <textarea
                bind:value={value.css}
                on:change={() => {
                  window.api.setConfig(
                    key,
                    JSON.stringify({
                      ...value,
                    }),
                  );
                }}
                class="h-full w-full bg-transparent p-2 font-mono text-sm outline-none"
                placeholder="Paste or type css code here..."
              ></textarea>
            </Tabs.Content>
          </div>
        </div>
      </Tabs.Root>
    </div>
  {/if}
{/if}
