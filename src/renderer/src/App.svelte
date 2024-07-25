<script lang="ts">
	import UrlBar from "./components/UrlBar.svelte";
	import Spinner from "./components/Spinner.svelte";
	import Platform from "./components/Platform.svelte";
	import WindowControls from "./components/WindowControls.svelte";
	import DiscordToggle from "./components/DiscordToggle.svelte";
	import Navigation from "./components/Navigation.svelte";
	import Tabs from "./components/FrameTabs.svelte";
	import { createFullscreenStore, createUrlDisplayStore } from "./lib/stores";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import Settings from "./components/settings/Settings.svelte";
	import { SettingsIcon } from "lucide-svelte";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let currentTab: string = "yt";
	let showSettings: boolean = false;
	let isLoaded: boolean = false;

	const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
	

	const fullscreen = createFullscreenStore(window.electron);
	const urlDisplay = createUrlDisplayStore(window.electron);


	let config: any = null;
	let isDark = darkThemeMq.matches;
	async function getConfig() {
		config = await window.electron.ipcRenderer.invoke("get-all-config");
		console.log(config);
	}

	getConfig();

	window.electron.ipcRenderer.on("refresh-config", ()=>getConfig());

	$: if(config) {
		if(config["theme"]==="light") {
			isDark = false;
		}
		else if(config["theme"]==="dark") {
			isDark = true;
		}
		else {
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

	onMount(() => {
		mounted = true;
	});

	function openSettings() {
		window.electron.ipcRenderer.send("open-settings");
		showSettings = true;
		isLoaded = true;
	}

	window.electron.ipcRenderer.on("loaded", () => {
		isLoaded = true;
	});


</script>

<div
	class="{isDark
		? 'dark'
		: 'light'} transition-all duration-200 flex flex-col h-[100vh] bg-zinc-50 dark:bg-neutral-900 dark:text-white"
>
	{#if mounted}
		<div
			in:fade={{ duration: 200, delay: 50 }}
			class="{$fullscreen
				? '-translate-y-8'
				: 'translate-y-0'} transition-all duration-200 flex drag h-[37px] items-center pr-[10px] box-border w-full gap-3"
		>
			<div class="w-[239px] flex items-center h-full gap-2 pl-4">
				<Platform is="darwin">
					<div class="w-[74px]"></div>
				</Platform>

				<Tabs bind:currentTab {showSettings} />
			</div>

			{#if isLoaded}
				{#if !showSettings}
					<Navigation {currentTab} />

					<UrlBar urlDisplay={$urlDisplay} {currentTab} />
				{/if}
			{/if}

			<div
				class="absolute top-0 right-0 h-full transition-all duration-200 px-2 flex items-center text-black bg-zinc-50 dark:bg-neutral-900 dark:text-white"
			>
				{#if !showSettings}
					<div class="flex gap-1 items-center options no-drag">
						<div class="flex items-center">
							<DiscordToggle />
						</div>
						<button class="flex items-center p-1" on:click={openSettings}>
							<SettingsIcon size={16} />
						</button>
					</div>
				{/if}
				<Platform is="win32">
					<WindowControls />
				</Platform>
			</div>
		</div>

		<div
			class="flex-grow flex items-center justify-center relative"
			in:fade={{ duration: 200, delay: 50 }}
		>
			{#if showSettings}
				<Settings bind:showSettings {config}/>
			{/if}
			{#if !isLoaded}
				<Spinner />
			{/if}
		</div>
	{/if}
</div>
