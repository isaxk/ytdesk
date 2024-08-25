<script>
  // @ts-nocheck

  import {
    CircleArrowOutDownRight,
    Cpu,
    Keyboard,
    Wifi,
    X,
  } from "lucide-svelte";
  import MacSpace from "../components/ui/MacSpace.svelte";
  import TabSidebarItem from "../components/settings/SidebarTab.svelte";
  import WindowControl from "../components/ui/WindowControl.svelte";
  import { Tabs } from "bits-ui";
  import SettingsItem from "../components/settings/SettingItem.svelte";
  import IconButton from "../components/ui/IconButton.svelte";
  import { activeView } from "../lib/stores";
  import { scale } from "svelte/transition";
  import Windowcontrol from "../components/ui/WindowControl.svelte";
  import KeybindInput from "../components/settings/KeybindInput.svelte";

  let tabs = [
    {
      value: "app",
      label: "Application",
      icon: Cpu,
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
          label: "Youtube Studio Tab",
          key: "studio-tab",
          restart: true,
          type: "switch",
        },
      ],
    },
    {
      value: "miniplayer",
      label: "Miniplayer",
      icon: CircleArrowOutDownRight,
      settings: [
        {
          label: "Keep on top",
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
    <div class=" max-w-screen-sm lg:max-w-screen-md flex-grow">
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
        <div class="w-full py-4">
          {#each tabs as tab}
            <Tabs.Content value={tab.value} class="flex-grow">
              <div class="flex flex-col gap-1">
                {#if tab.value == "keybinds"}
                  <div class="py-2 text-sm font-light text-neutral-800 dark:text-zinc-200">These keybinds work anywhere on your computer unless another app conflicts. (Supports music playback only)</div>
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
    </div>
  </Tabs.Root>
</div>

<div class="fixed flex left-0 top-0 h-10 w-full p-1 px-2 drag">
  <WindowControl />
</div>
