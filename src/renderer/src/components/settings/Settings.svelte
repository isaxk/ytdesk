<script lang="ts">
	import { Select, Tabs } from "bits-ui";
	import { Check, X } from "lucide-svelte";
	import { fade, scale } from "svelte/transition";
	import ThemeSelector from "./ThemeSelector.svelte";
	import SettingsItem from "./SettingsItem.svelte";
	import Switch from "./Switch.svelte";
	import ColorPicker from "./ColorPicker.svelte";

	export let showSettings;
	export let config;
	export let isDark;

	const tabs = [
		{
			value: "app",
			label: "Application",
		},
		{
			value: "yt",
			label: "Youtube",
		},
	];

	function closeSettings() {
		showSettings = false;
		window.setTimeout(() => {
			window.electron.ipcRenderer.send("close-settings");
		}, 100);
	}

</script>

<div
	class="absolute w-full h-full m-auto max-w-screen-md pt-20 px-5"
	in:scale={{ delay: 100, duration: 350, start: 1.05, opacity: 0 }}
	out:scale={{ duration: 350, start: 1.05, opacity: 0 }}
>
	<div class="flex items-center">
		<div class="text-3xl font-medium pl-2 flex-grow">Settings</div>
		<button
			on:click={closeSettings}
			class="p-5 hover:bg-zinc-200 hover:dark:bg-neutral-800 rounded-md transition-all"
			><X /></button
		>
	</div>

	<Tabs.Root class="flex pt-10 gap-10">
		<Tabs.List class="w-60 flex text-left flex-col gap-2">
			{#each tabs as tab}
				<Tabs.Trigger
					value={tab.value}
					class="py-2 px-3 transition-all text-lg text-left rounded-md data-[state=active]:bg-zinc-200 data-[state=active]:dark:bg-zinc-800"
					>{tab.label}</Tabs.Trigger
				>
			{/each}
		</Tabs.List>
		{#if config}
			<Tabs.Content value="app" class="flex-grow">
				<SettingsItem label="App Theme"><ThemeSelector value={config["theme"]} key="theme"/></SettingsItem>
			</Tabs.Content>
			<Tabs.Content value="yt" class="flex-grow">
				<SettingsItem label="Ad Blocking"><Switch key="ad-blocking" checked={config["ad-blocking"]}/></SettingsItem>
				<SettingsItem label="Force Cinema Mode"><Switch key="force-cinema" checked={config["force-cinema"]}/></SettingsItem>
				<SettingsItem label="Accent Color"><ColorPicker {isDark} key="yt-accent-color" hex={config["yt-accent-color"]}/></SettingsItem>
			</Tabs.Content>
		{/if}
	</Tabs.Root>
</div>
