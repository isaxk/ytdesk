<script>
  // @ts-nocheck

  import {
    CircleArrowOutDownRight,
    Cpu,
    Info,
    Keyboard,
    Paintbrush,
    Settings2,
    Wifi,
    X,
  } from "lucide-svelte";
  import MacSpace from "../components/ui/MacSpace.svelte";
  import TabSidebarItem from "../components/settings/SidebarTab.svelte";
  import WindowControl from "../components/ui/WindowControl.svelte";
  import { ScrollArea, Tabs } from "bits-ui";
  import SettingsItem from "../components/settings/SettingItem.svelte";
  import IconButton from "../components/ui/IconButton.svelte";
  import { activeView } from "../lib/stores";
  import { scale } from "svelte/transition";
  import Windowcontrol from "../components/ui/WindowControl.svelte";
  import KeybindInput from "../components/settings/KeybindInput.svelte";

  let tabs = [
    {
      value: "appearance",
      label: "Appearance",
      icon: Paintbrush,
      settings: [
        {
          label: "App Theme",
          key: "theme",
          type: "select",
          options: [
            {
              label: "Light",
              value: "light",
            },
            {
              label: "Dark",
              value: "dark",
            },
            {
              label: "Follow System",
              value: "system",
            },
          ],
        },
        {
          label: "YT Music Custom Theme",
          key: "music-css",
          type: "css",
        },
        {
          label: "Youtube Custom Theme",
          key: "yt-css",
          type: "css",
        },
      ],
    },
    {
      value: "app",
      label: "Behaviour",
      icon: Settings2,
      settings: [
        {
          label: "Youtube Studio Tab",
          key: "studio-tab",
          restart: true,
          type: "switch",
        },
        {
          label: "Force cinema mode",
          key: "force-cinema",
          type: "switch",
        },
        {
          label: "Keep miniplayer on top",
          key: "miniplayer-on-top",
          type: "switch",
        },
      ],
    },
    {
      value: "intergrations",
      label: "Intergrations",
      icon: Wifi,
      settings: [
        {
          label: "Discord Rich Presence",
          key: "discord-rpc",
          type: "switch",
        },
      ],
    },
    {
      value: "keybinds",
      label: "Keybinds",
      icon: Keyboard,
      settings: [
        {
          label: "Toggle Playback",
          key: "playback-bind",
          type: "keybind",
        },
        {
          label: "Next Song",
          key: "next-bind",
          type: "keybind",
        },
        {
          label: "Previous Song",
          key: "previous-bind",
          type: "keybind",
        },
      ],
    },
  ];
</script>

<div
  class="flex h-screen items-center justify-center bg-zinc-50 dark:bg-transparent"
  in:scale={{ start: 1.05, duration: 200 }}
>
  <!-- <header
		class="drag flex h-[40px] w-full items-center bg-zinc-100 pr-1 text-neutral-600 transition-all dark:bg-neutral-800 dark:text-neutral-400"
	>
		<MacSpace />
		<div class="flex-grow">Settings</div>
		<WindowControl closeOnly />
	</header> -->

  <Tabs.Root asChild>
    <div class="h-[450px] max-w-screen-md px- lg:px-0 flex-grow lg:max-w-screen-md">
      <div class="flex h-full gap-10">
        <Tabs.List
          class="text-md flex h-full w-72 flex-col text-left"
        >
          <h1 class="mb-5 text-4xl font-semibold">Settings</h1>
          <div class="flex-grow">
            {#each tabs as tab}
              <TabSidebarItem
                value={tab.value}
                label={tab.label}
                icon={tab.icon}
              />
            {/each}
          </div>
          <TabSidebarItem value="about" label="About" icon={Info} />
        </Tabs.List>

        <ScrollArea.Root class="relative h-full w-full pr-4 py-3 border-zinc-200 dark:border-neutral-800 rounded-md">
          <ScrollArea.Viewport class="h-full w-full">
            <ScrollArea.Content class="min-h-full">
              {#each tabs as tab}
                <Tabs.Content value={tab.value} class="w-full pb-10 text-md">
                  <div class="flex flex-col gap-3">
                    {#if tab.value == "keybinds"}
                      <div
                        class="text-wrap py-2 text-sm font-light text-neutral-800 dark:text-zinc-200"
                      >
                        These keybinds work anywhere on your computer unless
                        another app conflicts. (Supports music playback only)
                      </div>
                    {/if}
                    {#if tab.settings}
                      {#each tab.settings as setting}
                        <SettingsItem {...setting} />
                      {/each}
                    {/if}
                  </div>
                </Tabs.Content>
              {/each}
              <Tabs.Content value="about" class="w-full py-16 pr-4 h-full text-center">
                <div class="flex items-center justify-center h-full pt-20">
                  <div class="">
                    <div class="mb-5 flex">
                      <div class="">
                        <div class="text-4xl font-bold">YT Desk</div>
                        <div class="text-sm">v-.-.-</div>
                      </div>
                    </div>
                    <div class="text-sm mb-2">Made by isaxk</div>
                    <div class="text-md text-blue-400"><a href="https://github.com/isaxk/ytdesk" target="_blank">View on Github</a></div>
                  </div>
                </div>
              </Tabs.Content>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            orientation="vertical"
            class="flex h-full w-2.5 touch-none select-none rounded-full border-l border-l-transparent p-px transition-all hover:w-3"
          >
            <ScrollArea.Thumb
              class="relative flex-1 rounded-full bg-zinc-400 opacity-40 transition-opacity hover:opacity-100 dark:bg-white hover:dark:opacity-60"
            />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner />
        </ScrollArea.Root>
        <div>
          <IconButton
            icon={X}
            on:click={() => {
              window.api.closeSettings();
              activeView.set("topbar");
            }}
          />
        </div>
      </div>
    </div>
  </Tabs.Root>
</div>

<div class="drag fixed left-0 top-0 flex h-10 w-full justify-end p-1 px-2">
  <WindowControl />
</div>
