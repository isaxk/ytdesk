<script lang="ts">
	import { Select } from 'bits-ui';
	import { Check } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	export let key: string;
	export let value: string;
	export let isDark: boolean;

	export let options: { value: string; label: string }[];

	let selected;
	if (value) {
		selected = options.filter((e) => e.value == value)[0];
	} else {
		selected = options[0];
	}

	function handleChange(e) {
		selected = e;
		console.log(e);
		window.electron.ipcRenderer.send('update-config', key, e.value);
	}
</script>

<Select.Root items={options} bind:selected onSelectedChange={handleChange}>
	<Select.Trigger
		class="rounded-9px bg-background placeholder:text-foreground-alt/50 focus:ring-foreground focus:ring-offset-background inline-flex w-[200px] items-center rounded-md border border-zinc-300 px-[11px] py-2 text-sm  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-neutral-700"
		aria-label="Select a theme"
	>
		<Select.Value class="text-sm" placeholder="Select a theme" />
	</Select.Trigger>
	<Select.Content
		class="w-full rounded-xl border {isDark
			? 'border-zinc-700 bg-neutral-800 text-white'
			: 'bg-zinc-50'} shadow-popover px-1 py-3 outline-none"
		transition={fly}
		transitionConfig={{ y: -20, duration: 75 }}
		sideOffset={8}
	>
		{#each options as theme}
			<Select.Item
				class="rounded-button flex h-10 w-full select-none items-center rounded-md py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 dark:bg-neutral-900 {isDark
					? 'data-[highlighted]:bg-zinc-700'
					: 'data-[highlighted]:bg-zinc-200'}"
				value={theme.value}
				label={theme.label}
			>
				{theme.label}
				<Select.ItemIndicator class="ml-auto" asChild={false}>
					<Check size="15" />
				</Select.ItemIndicator>
			</Select.Item>
		{/each}
	</Select.Content>
	<Select.Input name="favoriteFruit" />
</Select.Root>
