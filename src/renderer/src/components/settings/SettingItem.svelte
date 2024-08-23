<script lang="ts">
	import { Select, Switch } from 'bits-ui';
	import { Check } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	export let label: string;
	export let key: string;
	export let type: string;
	export let restart = false;
	export let options: { label: string; value: string }[] = [];

	let value: any = null;

	onMount(async () => {
		value = await window.api.getConfig(key);
	});

	function handleSelect(e) {
		window.api.setConfig(key, e.value);
	}

	function handleSwitch(e) {
		console.log(e);
		window.api.setConfig(key, e);
	}
</script>

<div class="flex h-10 w-full items-center">
	<div class="flex-grow">
		{label}
		{#if restart}
			<div class="text-light text-xs text-neutral-700 dark:text-zinc-300">Requires Restart</div>
		{/if}
	</div>
	{#if value !== null}
		{#if type === 'select'}
			<Select.Root
				items={options}
				selected={options.filter((o) => o.value == value)[0]}
				onSelectedChange={handleSelect}
			>
				<Select.Trigger
					class="w-52 rounded border bg-zinc-50 px-2 py-1 text-left dark:border-neutral-700 dark:bg-neutral-900"
				>
					<Select.Value placeholder="Choose..." />
				</Select.Trigger>

				<Select.Content
					transition={fly}
					transitionConfig={{ y: -10, duration: 200 }}
					class="mt-2 flex flex-col rounded-md bg-zinc-50 text-black drop-shadow-md dark:bg-neutral-800 dark:text-white"
				>
					{#each options as option}
						<Select.Item
							value={option.value}
							class="flex items-center rounded-md px-3 py-2 data-[highlighted]:dark:bg-neutral-700"
						>
							<div class="flex-grow">{option.label}</div>

							<Select.ItemIndicator class="ml-auto" asChild={false}>
								<Check size={16} />
							</Select.ItemIndicator>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{:else if type === 'switch'}
			<Switch.Root
				id={key}
				onCheckedChange={handleSwitch}
				checked={value}
				class="h-8 w-14 rounded-full bg-zinc-100 p-1 transition-all data-[state=checked]:bg-zinc-200 dark:bg-neutral-800 data-[state=checked]:dark:bg-neutral-700"
			>
				<Switch.Thumb
					class="pointer-events-none block size-[24px] shrink-0 rounded-full bg-zinc-300 transition-all data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-zinc-400 dark:bg-neutral-600 data-[state=checked]:dark:bg-neutral-500"
				/>
			</Switch.Root>
		{/if}
	{/if}
</div>
