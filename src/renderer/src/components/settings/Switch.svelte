<script lang="ts">
	import { Switch } from 'bits-ui';

	export let checked: boolean = false;
	export let key: string;

	function handleChange(e) {
		checked = e;
		window.electron.ipcRenderer.send('update-config', key, e);
	}
</script>

<div class="flex items-center space-x-3">
	<Switch.Root
		onCheckedChange={handleChange}
		id="marketing"
		bind:checked
		class="focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-foreground data-[state=unchecked]:bg-dark-10 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-foreground peer inline-flex h-[36px] min-h-[36px] w-[60px] shrink-0 cursor-pointer items-center rounded-full bg-zinc-200 px-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-300 dark:bg-neutral-800 data-[state=checked]:dark:bg-neutral-700"
	>
		<Switch.Thumb
			class="bg-background data-[state=unchecked]:shadow-mini dark:bg-foreground dark:shadow-popover pointer-events-none block size-[30px] shrink-0 rounded-full bg-zinc-100 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-zinc-100  dark:bg-neutral-600 data-[state=checked]:dark:bg-neutral-400"
		/>
	</Switch.Root>
</div>
