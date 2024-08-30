<script>
  // @ts-nocheck

  import {
    CircleArrowOutDownRight,
    Cpu,
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
  class="flex h-screen items-center justify-center"
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
    <div class="h-96 max-w-screen-sm flex-grow lg:max-w-screen-md">
      <div class="mb-5 flex p-2 pr-0 text-4xl font-semibold">
        <h1 class="flex-grow">Settings</h1>
        <IconButton
          icon={X}
          on:click={() => {
            window.api.closeSettings();
            activeView.set("topbar");
          }}
        />
      </div>
      <div class="flex gap-10">
        <Tabs.List
          class="text-md flex h-full w-72 flex-col text-left transition-all"
        >
          {#each tabs as tab}
            <TabSidebarItem
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
            />
          {/each}
        </Tabs.List>

        {#each tabs as tab}
          <Tabs.Content
            value={tab.value}
            class="w-full overflow-y-scroll h-96py-2 pr-4"
          >
            <div class="flex flex-col gap-3">
              {#if tab.value == "keybinds"}
                <div
                  class="py-2 text-sm font-light text-neutral-800 dark:text-zinc-200 text-wrap"
                >
                  These keybinds work anywhere on your computer unless another
                  app conflicts. (Supports music playback only)
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
      </div>
    </div>
  </Tabs.Root>
</div>

<div class="drag fixed left-0 top-0 flex h-10 w-full justify-end p-1 px-2">
  <WindowControl />
</div>
