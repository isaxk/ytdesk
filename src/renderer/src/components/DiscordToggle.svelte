<script lang="ts">
	import { Toggle } from 'bits-ui';
	import DiscordIcon from '../assets/discord.svg';
	import { writable } from 'svelte/store';

	const rpcActive = writable<boolean>(false);
	if (localStorage.rpc) {
		rpcActive.set(JSON.parse(localStorage.rpc));
	} else {
		localStorage.rpc = true;
		rpcActive.set(true);
	}
	rpcActive.subscribe((v) => {
		localStorage.setItem('rpc', JSON.stringify(v));
		window.electron.ipcRenderer.send(v ? 'enable-rpc' : 'disable-rpc');
	});
</script>

<Toggle.Root
	bind:pressed={$rpcActive}
	class="[>img]:dark:brightness-200 flex items-center rounded-md p-2 drop-shadow-sm transition-all data-[state=on]:bg-neutral-300 data-[state=on]:invert-0 data-[state=on]:dark:bg-neutral-700 [&[data-state=off]>img]:saturate-0"
>
	<img
		src={DiscordIcon}
		alt="Discord"
		class="wow h-4 w-4 drop-shadow-xl transition-all dark:invert"
	/>
</Toggle.Root>

<style>
	.wow {
		filter: invert(48%) sepia(58%) saturate(5406%) hue-rotate(221deg) brightness(95%) contrast(100%);
	}
</style>
