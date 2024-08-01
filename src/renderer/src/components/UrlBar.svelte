<script lang="ts">
	import YTIcon from '../assets/youtube.png';
	import MusicIcon from '../assets/music.png';

	export let urlDisplay: string;
	export let currentTab: string;
</script>

<div
	class="flex flex-grow flex-nowrap items-center gap-0.5 text-left text-xs text-zinc-600 dark:text-zinc-300"
>
	<div class="flex w-6 items-center justify-center">
		{#if currentTab === 'yt'}
			<img src={YTIcon} alt="youtube.com" class="h-[20px]" />
		{:else}
			<img src={MusicIcon} alt="youtube.com" class="h-[12px]" />
		{/if}
	</div>
	<div class="w-full max-w-96 overflow-x-hidden text-ellipsis text-nowrap">
		{urlDisplay}
	</div>
</div>
