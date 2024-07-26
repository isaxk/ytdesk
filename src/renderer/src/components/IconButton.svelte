<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { Icon } from "lucide-svelte";
    import type { ComponentType } from 'svelte';

	export let icon: ComponentType<Icon>;
    export let iconSize: number = 16;
	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch("click");
	}
</script>

<button
	on:click={handleClick}
	class="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-2 rounded-md transition-all"
>
	<svelte:component this={icon} size={iconSize} />
</button>
