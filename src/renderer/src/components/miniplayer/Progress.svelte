<script>
	import { Slider } from 'bits-ui';

    export let vidLength;
    export let onValueChange;
    export let progress;
</script>

<Slider.Root
	let:thumbs
	min={0}
	max={vidLength}
	step={1}
	{onValueChange}
	class="absolute bottom-0 h-1 w-full transition-all hover:h-2"
	value={[progress]}
>
	<Slider.Range class="h-full bg-white/70 transition-all" />
	{#each thumbs as thumb}
		<Slider.Thumb {thumb} />
	{/each}
</Slider.Root>
