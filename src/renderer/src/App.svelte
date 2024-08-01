<script lang="ts">
	import UrlBar from './components/UrlBar.svelte';
	import Spinner from './components/Spinner.svelte';
	import Platform from './components/Platform.svelte';
	import WindowControls from './components/WindowControls.svelte';
	import DiscordToggle from './components/DiscordToggle.svelte';
	import Navigation from './components/Navigation.svelte';
	import Tabs from './components/FrameTabs.svelte';
	import { createFullscreenStore, createUrlDisplayStore } from './lib/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Settings from './components/settings/Settings.svelte';
	import { SettingsIcon } from 'lucide-svelte';
	import IconButton from './components/IconButton.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let currentTab: string = 'yt';
	let showSettings: boolean = false;
	let isLoaded: boolean = false;

	const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');

	const fullscreen = createFullscreenStore(window.electron);
	const urlDisplay = createUrlDisplayStore(window.electron);

	let config: any = null;
	let isDark = darkThemeMq.matches;
	async function getConfig() {
		config = await window.electron.ipcRenderer.invoke('get-all-config');
		console.log(config);
	}

	getConfig();

	window.electron.ipcRenderer.on('refresh-config', () => getConfig());

	$: if (config) {
		if (config['theme'] === 'light') {
			isDark = false;
		} else if (config['theme'] === 'dark') {
			isDark = true;
		} else {
			isDark = darkThemeMq.matches;
		}
	}

	darkThemeMq.addListener((e) => {
		if (e.matches) {
			isDark = true;
		} else {
			isDark = false;
		}
	});

	let mounted = false;

	onMount(async () => {
		mounted = true;
		isLoaded = await window.electron.ipcRenderer.invoke('is-loaded');
	});

	function sendOpenSettings() {
		window.electron.ipcRenderer.send('open-settings');
	}

	window.electron.ipcRenderer.on('loaded', () => {
		isLoaded = true;
	});

	window.electron.ipcRenderer.on('open-settings', () => {
		showSettings = true;
	});

	window.electron.ipcRenderer.on('close-settings', () => {
		showSettings = false;
	});
</script>

<div
	class="{isDark
		? 'dark'
		: 'light'} flex h-[100vh] flex-col bg-zinc-50 transition-all duration-200 dark:bg-neutral-900 dark:text-white"
>
	{#if mounted}
		<div
			in:fade={{ duration: 200, delay: 50 }}
			class="{$fullscreen
				? '-translate-y-8'
				: 'translate-y-0'} drag box-border flex h-[37px] w-full items-center gap-3 pr-[10px] transition-all duration-200"
		>
			<div class="flex h-full w-[239px] items-center gap-2 pl-4">
				<Platform is="darwin">
					<div class="w-[74px]"></div>
				</Platform>

				{#if isLoaded}
					<Tabs bind:currentTab {showSettings} />
				{/if}
			</div>

			{#if isLoaded}
				{#if !showSettings}
					<Navigation {currentTab} />

					<UrlBar urlDisplay={$urlDisplay} {currentTab} />
				{/if}
			{/if}

			<div
				class="absolute right-0 top-0 flex h-full items-center bg-zinc-50 px-2 text-black transition-all duration-200 dark:bg-neutral-900 dark:text-white"
			>
				{#if !showSettings && isLoaded}
					<div class="options no-drag flex items-center gap-1">
						<div
							class="flex items-center rounded-md transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
						>
							<DiscordToggle />
						</div>
						<IconButton on:click={sendOpenSettings} icon={SettingsIcon} />
					</div>
				{/if}
				<Platform is="win32">
					<WindowControls />
				</Platform>
			</div>
		</div>

		<div
			class="relative flex flex-grow items-center justify-center"
			in:fade={{ duration: 200, delay: 50 }}
		>
			{#if showSettings}
				<Settings bind:showSettings {config} {isDark} />
			{/if}
			{#if !isLoaded}
				<Spinner />
			{/if}
		</div>
	{/if}
</div>
