<script lang="ts">
	import { Minus, Square, X } from 'lucide-svelte';
	import IconButton from './IconButton.svelte';

	function emmit(message: string) {
		window.electron.ipcRenderer.send('window-control', message);
	}
</script>

<div
	class="no-drag [>button]:w-10 ml-2 flex border-l-[1px] border-zinc-400 pl-2 text-sm dark:border-zinc-700"
>
	<IconButton on:click={() => emmit('minimize')} icon={Minus} iconSize={17} />
	<IconButton on:click={() => emmit('maximize')} icon={Square} />
	<IconButton on:click={() => emmit('close')} icon={X} iconSize={18} />
</div>
