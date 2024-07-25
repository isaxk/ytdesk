<script lang="ts">
	import { Tabs } from "bits-ui";

	export let currentTab: string;
	export let showSettings: boolean;

	$: window.electron.ipcRenderer.send("nav", currentTab);

	const tabs = [
		{
			label: "Youtube",
			value: "yt",
		},
		{
			label: "Music",
			value: "music",
		},
	];
</script>

<Tabs.Root
	bind:value={currentTab}
	class="h-full no-drag flex-grow {showSettings ? 'opacity-0' : 'opacity-100'}"
>
	<Tabs.List class="flex items-center gap-2 text-sm no-drag h-full pt-1">
		{#each tabs as tab}
			<Tabs.Trigger
				value={tab.value}
				class="no-drag text-center pb-1 px-4 text-zinc-400 hover:text-zinc-600 hover:dark:text-zinc-400 dark:text-zinc-500 h-full transition-all duration-200 data-[state=active]:bg-white data-[state=active]:drop-shadow-md rounded-t-md data-[state=active]:dark:bg-black data-[state=active]:text-black data-[state=active]:dark:text-white"
				>{tab.label}</Tabs.Trigger
			>
		{/each}
	</Tabs.List>
</Tabs.Root>
