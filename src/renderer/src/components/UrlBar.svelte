<script lang="ts">
	import YTIcon from "../assets/youtube.png";
	import MusicIcon from "../assets/music.png";

	export let urlDisplay: string;
	export let currentTab: string;
</script>

<div
	class="flex-grow flex flex-nowrap gap-0.5 items-center text-left text-xs text-zinc-600 dark:text-zinc-300"
>
	<div class="w-6 flex items-center justify-center">
		{#if currentTab === "yt"}
			<img src={YTIcon} alt="youtube.com" class="h-[20px]" />
		{:else}
			<img src={MusicIcon} alt="youtube.com" class="h-[12px]" />
		{/if}
	</div>
	<div class="max-w-96 w-full text-nowrap overflow-x-hidden text-ellipsis">
		{urlDisplay}
	</div>
</div>
