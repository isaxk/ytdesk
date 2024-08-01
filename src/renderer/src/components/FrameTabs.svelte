<script lang="ts">
	import { Tabs } from 'bits-ui';

	export let currentTab: string;
	export let showSettings: boolean;

	$: window.electron.ipcRenderer.send('nav', currentTab);

	const tabs = [
		{
			label: 'Youtube',
			value: 'yt'
		},
		{
			label: 'Music',
			value: 'music'
		}
	];

	window.electron.ipcRenderer.on('nav', (_, m) => {
		currentTab = m;
	});
</script>

<Tabs.Root
	bind:value={currentTab}
	class="no-drag h-full flex-grow {showSettings ? 'opacity-0' : 'opacity-100'}"
>
	<Tabs.List class="no-drag flex h-full items-center gap-2 pt-1 text-sm">
		{#each tabs as tab}
			<Tabs.Trigger
				value={tab.value}
				class="no-drag h-full rounded-t-md px-4 pb-1 text-center text-zinc-400 transition-all duration-200 hover:text-zinc-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:drop-shadow-md dark:text-zinc-500 hover:dark:text-zinc-400 data-[state=active]:dark:bg-black data-[state=active]:dark:text-white"
				>{tab.label}</Tabs.Trigger
			>
		{/each}
	</Tabs.List>
</Tabs.Root>
