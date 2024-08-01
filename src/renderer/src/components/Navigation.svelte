<script lang="ts">
	import { ArrowLeft, RotateCw } from 'lucide-svelte';
	import IconButton from './IconButton.svelte';

	export let currentTab: string;

	function back(): void {
		window.electron.ipcRenderer.send('page-action', { action: 'back', view: currentTab });
	}

	function refresh(): void {
		window.electron.ipcRenderer.send('page-action', { action: 'refresh', view: currentTab });
	}
</script>

<div class="no-drag flex items-center gap-1 text-black dark:text-white">
	<IconButton on:click={back} icon={ArrowLeft} />
	<IconButton on:click={refresh} icon={RotateCw} iconSize={14} />
</div>
