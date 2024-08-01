<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { Check, Github, GithubIcon, X } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import Select from './Select.svelte';
	import SettingsItem from './SettingsItem.svelte';
	import Switch from './Switch.svelte';
	import ColorPicker from './ColorPicker.svelte';
	import AppIcon from '../../assets/icon.png';
	import { onMount } from 'svelte';

	export let showSettings;
	export let config;
	export let isDark;

	const tabs = [
		{
			value: 'app',
			label: 'Application'
		},
		{
			value: 'yt',
			label: 'Youtube'
		},
		{
			value: 'about',
			label: 'About'
		}
	];

	function closeSettings() {
		showSettings = false;
		window.setTimeout(() => {
			window.electron.ipcRenderer.send('close-settings');
		}, 100);
	}

	let version;
	onMount(async () => {
		version = await window.electron.ipcRenderer.invoke('app-v');
	});
</script>

<div
	class="absolute m-auto h-full w-full max-w-screen-md px-5 pt-20"
	in:scale={{ delay: 100, duration: 350, start: 1.05, opacity: 0 }}
	out:scale={{ duration: 350, start: 1.05, opacity: 0 }}
>
	<div class="flex items-center">
		<div class="flex-grow pl-2 text-3xl font-bold">Settings</div>
		<button
			on:click={closeSettings}
			class="rounded-md p-5 transition-all hover:bg-zinc-200 hover:dark:bg-neutral-800"
			><X /></button
		>
	</div>

	<Tabs.Root class="flex gap-10 pt-10">
		<Tabs.List class="flex w-60 flex-col gap-2 text-left">
			{#each tabs as tab}
				<Tabs.Trigger
					value={tab.value}
					class="rounded-md px-3 py-2 text-left text-lg transition-all data-[state=active]:bg-zinc-200 data-[state=active]:dark:bg-zinc-800"
					>{tab.label}</Tabs.Trigger
				>
			{/each}
		</Tabs.List>
		{#if config}
			<Tabs.Content value="app" class="flex-grow">
				<SettingsItem label="App Theme"
					><Select
						options={[
							{ value: 'light', label: 'Light' },
							{ value: 'dark', label: 'Dark' },
							{ value: 'system', label: 'Follow System' }
						]}
						value={config['theme']}
						key="theme"
						{isDark}
					/></SettingsItem
				>
				<SettingsItem label="Default tab"
					><Select
						options={[
							{ value: 'yt', label: 'Youtube' },
							{ value: 'music', label: 'Youtube Music' }
						]}
						value={config['default-tab']}
						key="default-tab"
						{isDark}
					/></SettingsItem
				>
				<SettingsItem label="Open at login"
					><Switch key="open-at-login" checked={config['open-at-login']} /></SettingsItem
				>
			</Tabs.Content>
			<Tabs.Content value="yt" class="flex-grow">
				<SettingsItem label="Ad Blocking"
					><Switch key="ad-blocking" checked={config['ad-blocking']} /></SettingsItem
				>
				<SettingsItem label="Force Cinema Mode"
					><Switch key="force-cinema" checked={config['force-cinema']} /></SettingsItem
				>
				<SettingsItem label="Accent Color"
					><ColorPicker
						{isDark}
						key="yt-accent-color"
						hex={config['yt-accent-color']}
					/></SettingsItem
				>
			</Tabs.Content>
			<Tabs.Content value="about" class="flex-grow">
				<div class="flex items-center gap-2">
					<img src={AppIcon} alt="" class="w-20" />
					<div class="text-5xl font-black">YT Desk</div>
				</div>

				<div class="mt-4 flex">
					<div class="flex flex-grow flex-col gap-1 px-2">
						<div class="">Version: v{version ? version : '...'}</div>
						<div class="">&copy; isaxk.com</div>
					</div>
					<button on:click={() => window.open('https://www.github.com/isaxk/ytdesk')}
						><GithubIcon /></button
					>
				</div>
			</Tabs.Content>
		{/if}
	</Tabs.Root>
</div>
