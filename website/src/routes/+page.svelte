<script lang="ts">
	import { inview } from 'svelte-inview';

	let video: HTMLVideoElement;
</script>

<header
	class="h-screen flex items-center justify-center relative overflow-y-hidden bg-gradient-to-tr from-slate-950 to-emerald-950 text-white"
>
	<div class="absolute m-auto flex flex-col gap-32 items-end w-screen-2xl z-0">
		<img src="/ythero.png" alt="" class="max-w-[960px] -translate-x-80 sm:-translate-x-40" />
		<img src="/musichero.png" alt="" class="max-w-[960px] translate-x-80 sm:translate-x-40" />
	</div>

	<div class="text-center z-20 -mt-6">
		<h1 class="text-6xl font-extrabold">YT Desk</h1>
		<h3 class="text-lg font-medium mt-2 mb-4 text-zinc-200">Youtube & YT Music supercharged</h3>
        <a href="https://github.com/isaxk/ytdesk/releases/latest" class="py-2.5 px-6 bg-white/30 rounded text-white">Download</a>
	</div>
</header>

<section class="max-w-screen-sm m-auto mt-20 flex flex-col sm:flex-row justify-center gap-10 sm:gap-20 px-10 box-content">
	<!-- svelte-ignore a11y-media-has-caption -->
	<div class="sm:w-60 flex items-center justify-center sm:justify-start">
		<img src="/miniplayer.png" alt="IGOR Miniplayer" class="w-60 h-60" />
	</div>
	<div class="flex-grow sm:flex justify-end text-center sm:text-left">
		<div>
			<div class="text-4xl font-bold mb-4">Miniplayer</div>
			<ul class="text-lg list-disc ml-4 w-full">
				<li>Simple and clean</li>
				<li>Quick access to frequent controls</li>
				<li>Always on top (optional)</li>
			</ul>
		</div>
	</div>
</section>

<section class="max-w-screen-sm m-auto mt-40 sm:mt-20 flex flex-col-reverse sm:flex-row justify-center gap-10 sm:gap-20 px-10 box-content mb-32">
	<!-- svelte-ignore a11y-media-has-caption -->

	<div class="sm:w-1/2 pt-10 text-center sm:text-left text-lg">
		<div class="text-4xl font-bold mb-4">Discord Presence</div>
		Share what your listening to/watching with your discord friends.
	</div>
	<div class="sm:w-60 flex items-center justify-center sm:justify-end">
		<img src="/discord.png" alt="IGOR Miniplayer" class="w-60 h-60 scale-125" />
	</div>
</section>

<style lang="postcss">
	:global(body) {
		@apply bg-neutral-900 text-zinc-200;
	}
</style>
