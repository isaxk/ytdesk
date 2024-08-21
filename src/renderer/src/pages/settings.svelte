<script>
  import { CircleArrowOutDownRight, Cpu, Wifi } from 'lucide-svelte'
  import MacSpace from '../components/MacSpace.svelte'
  import TabSidebarItem from '../components/settings/TabSidebarItem.svelte'
  import WindowControl from '../components/WindowControl.svelte'
  import { Tabs } from 'bits-ui'
  import Setting from '../components/settings/Setting.svelte'

  let tabs = [
    {
      value: 'app',
      label: 'Application',
      icon: Cpu,
      settings: [
        {
          label: 'App Theme',
          key: 'theme',
          type: 'select',
          options: [
            {
              label: 'Light',
              value: 'light'
            },
            {
              label: 'Dark',
              value: 'dark'
            },
            {
              label: 'Follow System',
              value: 'system'
            }
          ]
        },
        {
          label: 'Youtube Studio Tab',
          key: 'studio-tab',
          restart: true,
          type: 'switch'
        }
      ]
    },
    {
      value: 'miniplayer',
      label: 'Miniplayer',
      icon: CircleArrowOutDownRight,
      settings: [
        {
          label: 'Keep on top',
          key: 'miniplayer-on-top',
          type: 'switch'
        }
      ]
    },
    {
      value: 'intergrations',
      label: 'Intergrations',
      icon: Wifi,
      settings: [
        {
          label: 'Discord Rich Presence',
          key: 'discord-rpc',
          type: 'switch'
        }
      ]
    }
  ]
</script>

<div class="flex h-screen flex-col">
  <header
    class="drag flex h-9 w-full items-center bg-zinc-100 pr-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 transition-all"
  >
    <MacSpace />
    <div class="flex-grow">Settings</div>
    <WindowControl closeOnly />
  </header>

  <Tabs.Root class="flex flex-grow gap-5">
    <Tabs.List
      class="text-md flex h-full w-52 flex-col border-r bg-zinc-50 text-left dark:border-neutral-900 dark:bg-neutral-900 transition-all"
    >
      {#each tabs as tab}
        <TabSidebarItem value={tab.value} label={tab.label} icon={tab.icon} />
      {/each}
    </Tabs.List>
    <div class="w-full py-4 pr-5">
      {#each tabs as tab}
        <Tabs.Content value={tab.value} class="flex-grow">
          <div class="flex flex-col gap-1">
            {#if tab.settings}
              {#each tab.settings as setting}
                <Setting {...setting} />
              {/each}
            {/if}
          </div>
        </Tabs.Content>
      {/each}
    </div>
  </Tabs.Root>
</div>
