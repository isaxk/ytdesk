<script lang="ts">
	import UrlBar from "./components/UrlBar.svelte";

	import Spinner from "./components/Spinner.svelte";
	import Platform from "./components/Platform.svelte";
	import WindowControls from "./components/WindowControls.svelte";
	import DiscordToggle from "./components/DiscordToggle.svelte";
	import Navigation from "./components/Navigation.svelte";
	import Tabs from "./components/Tabs.svelte";
	import { createFullscreenStore, createUrlDisplayStore } from "./lib/stores";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let currentTab: string = "yt";

	const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
	let isDark = darkThemeMq.matches;

	const fullscreen = createFullscreenStore(window.electron);
	const urlDisplay = createUrlDisplayStore(window.electron);

	darkThemeMq.addListener((e) => {
		if (e.matches) {
			isDark = true;
		} else {
			isDark = false;
		}
	});
</script>

<div
	class="{currentTab == 'music' || isDark
		? 'dark'
		: 'light'} transition-all duration-300 flex flex-col h-[100vh] bg-zinc-50 dark:bg-neutral-900 dark:text-white"
>
	<div
		class="{$fullscreen
			? '-translate-y-8'
			: 'translate-y-0'} transition-all flex drag h-[37px] items-center pr-[10px] box-border w-full gap-3"
	>
		<div class="w-[239px] flex items-center h-full gap-2">
			<Platform is="darwin">
				<div class="w-[74px]"></div>
			</Platform>

			<Tabs bind:currentTab />
		</div>
		<Navigation {currentTab}/>

		<UrlBar urlDisplay={$urlDisplay} {currentTab} />

		<div
			class="absolute top-0 right-0 h-full transition-all px-2 flex items-center bg-zinc-100 dark:bg-neutral-900"
		>
			<div
				class="options no-drag pr-2 border-r-[1px] border-zinc-400 dark:border-zinc-700"
			>
				<div class="flex items-center">
					<DiscordToggle />
				</div>
			</div>

			<Platform is="win32">
				<WindowControls />
			</Platform>
		</div>
	</div>

	<div class="flex-grow flex items-center justify-center">
		<Spinner />
	</div>
</div>
