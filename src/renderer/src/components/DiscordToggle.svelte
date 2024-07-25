<script lang="ts">
	import { Toggle } from "bits-ui";
	import DiscordIcon from "../assets/discord.svg";
	import { writable } from "svelte/store";

	const rpcActive = writable<boolean>(false);
	if (localStorage.rpc) {
		rpcActive.set(JSON.parse(localStorage.rpc));
	} else {
		localStorage.rpc = true;
		rpcActive.set(true);
	}
	rpcActive.subscribe((v) => {
		localStorage.setItem("rpc", JSON.stringify(v));
		window.electron.ipcRenderer.send(v ? "enable-rpc" : "disable-rpc");
	});
</script>

<Toggle.Root
	bind:pressed={$rpcActive}
	class="p-2 transition-all rounded-md drop-shadow-sm flex items-center data-[state=on]:bg-neutral-300 data-[state=on]:dark:bg-neutral-700 data-[state=on]:invert-0 [&[data-state=off]>img]:saturate-0 [>img]:dark:brightness-200"
>
	<img
		src={DiscordIcon}
		alt="Discord"
		class="w-4 h-4 wow drop-shadow-xl transition-all dark:invert"
	/>
</Toggle.Root>

<style>
	.wow {
		filter: invert(48%) sepia(58%) saturate(5406%) hue-rotate(221deg)
			brightness(95%) contrast(100%);
	}
</style>
