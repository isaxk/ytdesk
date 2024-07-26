<script>
	import ChangingColours from "./ChangingColours.svelte";
	import FeatureGridItem from "./FeatureGridItem.svelte";
</script>

<div
	class="pt-0 flex h-[110vh] flex-col items-center justify-center relative overflow-hidden bg-gradient-to-tr from-slate-950 to-emerald-950"
>
	<img
		src="/trendingpage.png"
		alt="Trending Page"
		class="w-2/3 self-start glide-left"
	/>
	<div class="text-center flex flex-col gap-2 mb-5">
		<div class="text-6xl font-black flex gap-2 items-center"><img src="/icon.png" alt="Icon" class="w-[80px] translate-y-0.5"/> YT Desk</div>
		<div class="text-lg font-medium">Videos and music in one place.</div>
		<div class="flex justify-center">
			<a
				href="https://www.github.com/isaxk/ytdesk/releases/latest"
				class="p-2 px-8 w-max rounded-md bg-zinc-50 bg-opacity-20 mt-3"
				>Download</a
			>
		</div>
	</div>
	<img
		src="/musicpage.png"
		alt="Music Page"
		class="w-2/3 self-end glide-right"
	/>
	<div
		class="absolute left-0 bottom-0 w-full h-[30vh] bg-gradient-to-b from-transparent via-zinc-900 via-90% to-zinc-900"
	></div>
</div>
<div
	class="pt-40 px-16 pb-10 flex justify-center max-w-screen-lg m-auto gap-10"
>
	<div class="w-1/2 flex flex-col gap-5 px-5 pt-5">
		<div class="text-4xl font-bold">Discord Rich<br />Presence</div>
		<div class="text-xl">
			Let your friends know what you're watching or listening to.
		</div>
	</div>
	<div class="relative w-1/2">
		<img src="/3nightsrpc.png" alt="Discord Rich Presensce" class="w-72 rounded-lg brightness-75" />
		<img
			src="/mrbeastrpc.png"
			alt="Discord Rich Presensce"
			class="w-72 absolute top-10 left-40 rounded-lg big-shadow"
		/>
		<div
			class="absolute -bottom-20 left-0 w-[120%] h-60 bg-gradient-to-b from-transparent to-zinc-900"
		></div>
	</div>
</div>
<div
	class="pt-20 px-16 pb-20 flex justify-center max-w-screen-lg gap-10 m-auto"
>
	<ChangingColours />
	<div class="w-1/2 flex flex-col gap-5 pt-5">
		<div class="text-4xl font-bold">Choose your<br />color</div>
		<div class="text-xl">
			Give your watching experience a little dash of personality.
		</div>
	</div>
</div>
<div class="pt-52 px-16 pb-20 flex flex-col gap-10 justify-center max-w-screen-lg m-auto">
    <div class="text-4xl font-bold text-center border-b-2 border-zinc-600 pb-5">And more...</div>
    <div class="grid grid-cols-3">
        <FeatureGridItem title="Ad blocking" description="Uninterupted watching and listening"/>
        <FeatureGridItem title="Auto theatre mode" description="Use theatre mode everytime."/>
        <FeatureGridItem title="Easy Access" description="Jump into music or watching with ease."/>
    </div>
</div>

<style lang="postcss">
	.glide-left {
		animation: left-glide 30s;
	}
	.glide-right {
		animation: right-glide 30s;
	}
	.big-shadow {
		box-shadow: -7px -5px 15px 4px rgba(0,0,0,0.1);
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
