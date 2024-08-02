<script>
	import ChangingColours from './ChangingColours.svelte';
	import FeatureGridItem from './FeatureGridItem.svelte';
</script>

<div
	class="relative h-[110vh] overflow-hidden bg-gradient-to-tr from-slate-950 to-emerald-950 pt-0"
>
	<div class="w-screen-xl m-auto flex h-full flex-col items-center justify-center overflow-hidden">
		<img
			src="/trendingpage.png"
			alt="Trending Page"
			class="glide-left -ml-40 w-[120%] max-w-[1100px] self-start xl:ml-0 2xl:w-2/3"
		/>
		<div class="mb-5 flex flex-col gap-2 text-center">
			<div class="flex items-center gap-2 text-6xl font-black">
				<img src="/icon.png" alt="Icon" class="w-[80px] translate-y-0.5" /> YT Desk
			</div>
			<div class="text-lg font-medium">Videos and music in one place.</div>
			<div class="flex justify-center">
				<a
					href="https://www.github.com/isaxk/ytdesk/releases/latest"
					class="mt-3 w-max rounded-md bg-zinc-50 bg-opacity-20 p-2 px-8">Download</a
				>
			</div>
		</div>
		<img
			src="/musicpage.png"
			alt="Music Page"
			class="glide-right -mr-40 w-[120%] max-w-[1100px] self-end xl:mr-0 2xl:w-2/3"
		/>
	</div>
	<div
		class="absolute bottom-0 left-0 h-[30vh] w-full bg-gradient-to-b from-transparent via-zinc-900 via-90% to-zinc-900"
	></div>
</div>
<div
	class="overflox-x-hidden m-auto flex max-w-screen-lg flex-col justify-center gap-10 px-5 pb-10 pt-24 md:flex-row"
>
	<div class="flex w-full flex-col gap-5 px-5 pt-5 text-center md:w-1/2 md:text-left">
		<div class="text-4xl font-bold">Discord Rich<br />Presence</div>
		<div class="text-xl">Let your friends know what you're watching or listening to.</div>
	</div>
	<div
		class="overflox-x-hidden relative mx-auto w-full max-w-[500px] pl-0 md:ml-0 md:w-1/2 md:max-w-full md:scale-100"
	>
		<img
			src="/3nightsrpc.png"
			alt="Discord Rich Presensce"
			class="w-72 rounded-lg brightness-75 md:mx-0"
		/>
		<div class="absolute left-0 top-10 flex w-full justify-end">
			<img src="/mrbeastrpc.png" alt="Discord Rich Presensce" class="big-shadow w-72 rounded-lg" />
		</div>
		<div
			class="absolute -bottom-20 left-0 h-60 bg-gradient-to-b from-transparent to-zinc-900 md:w-[120%]"
		></div>
	</div>
</div>
<div
	class="m-auto flex max-w-screen-lg flex-col-reverse justify-center gap-10 px-5 pb-52 pt-20 md:flex-row"
>
	<ChangingColours />
	<div class="flex flex-col gap-5 pt-5 text-center md:w-1/2 md:text-left">
		<div class="text-4xl font-bold">Choose your<br />color</div>
		<div class="text-xl">Give your watching experience a little dash of personality.</div>
	</div>
</div>
<div class="m-auto flex max-w-screen-lg flex-col justify-center gap-10 px-16 pb-20 pt-52">
	<div class="border-b-2 border-zinc-600 pb-5 text-center text-4xl font-bold">And more...</div>
	<div class="grid md:grid-cols-3">
		<FeatureGridItem title="Ad blocking" description="Uninterupted watching and listening" />
		<FeatureGridItem title="Auto theatre mode" description="Use theatre mode everytime." />
		<FeatureGridItem title="Easy Access" description="Jump into music or watching with ease." />
	</div>
</div>
<div class="m-auto flex max-w-screen-lg items-center justify-end gap-4 px-16 py-10">
	<div>&copy; <a href="https://www.isaxk.com" class="hover:underline">isaxk.com</a></div>
	<a href="https://www.github.com/isaxk/ytdesk" class="hover:underline">Project on GitHub</a>
</div>

<style lang="postcss">
	.glide-left {
		animation: left-glide 30s;
	}
	.glide-right {
		animation: right-glide 30s;
	}
	.big-shadow {
		box-shadow: -7px -5px 15px 4px rgba(0, 0, 0, 0.1);
	}

	@keyframes left-glide {
		from {
			transform: translateX(10px);
		}
		to {
			transform: translateX(-30px);
		}
	}

	@keyframes right-glide {
		from {
			transform: translateX(-10);
		}
		to {
			transform: translateX(30px);
		}
	}
</style>
