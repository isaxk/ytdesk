<script lang="ts">
	import { ArrowLeft, RotateCw } from "lucide-svelte";

	export let currentTab:string;

	function back(): void {
		window.electron.ipcRenderer.send("page-action", {action:"back",view:currentTab});
	}

	function refresh(): void {
		window.electron.ipcRenderer.send("page-action", {action:"refresh",view:currentTab});
	}
</script>

<div class="flex items-center no-drag">
	<button
		on:click={back}
		class="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-2 rounded-md transition-all"
	>
		<ArrowLeft size="16" />
	</button>
	<button
		on:click={refresh}
		class="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-2 rounded-md transition-all"
	>
		<RotateCw size="14" />
	</button>
</div>
