
<script lang="ts">
  import { Tabs, Toggle } from "bits-ui";
  import DiscordIcon from "./assets/discord.svg";
  import { writable } from "svelte/store";
  import { ArrowLeft, RotateCw } from "lucide-svelte";
  import YTICON from "./assets/youtube.png";
  import Spinner from "./components/Spinner.svelte";
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  let urlD:string = "/";

  const rpcActive = writable<boolean>(false);
  if(localStorage.rpc) {
    rpcActive.set(JSON.parse(localStorage.rpc));
  }
  else {
    localStorage.rpc = true;
    rpcActive.set(true);
  }
  rpcActive.subscribe((v)=>{
    localStorage.setItem("rpc", JSON.stringify(v));
    window.electron.ipcRenderer.send(v ? "enable-rpc":"disable-rpc");
  })


  window.electron.ipcRenderer.on("navigate", (evt, url)=>{
	console.log(evt);
    urlD = url.replace("https://www.youtube.com", "").replace("https://music.youtube.com","");
  })

  function back(): void {
	window.electron.ipcRenderer.send("back");
  }

  function refresh(): void {
	window.electron.ipcRenderer.send("refresh");
  }

  function yt(): void {
	window.electron.ipcRenderer.send("nav-yt");
  }

  function music(): void {
	window.electron.ipcRenderer.send("nav-music");
  }

  let currentTab:string = "yt";

  $: window.electron.ipcRenderer.send("nav-"+currentTab);

  const tabs = [
	{
		label: "Youtube",
		value: "yt"
	},
	{
		label: "Music",
		value: "music"
	}
  ]
</script>


<div class="flex flex-col h-[100vh] bg-zinc-100 dark:bg-neutral-800 dark:text-white">
  <div class="flex drag items-center pr-[10px] box-border h-[37px] w-full drop-shadow gap-3">
    <div class="w-[70px]"></div>
	<div class="no-drag">
		<Tabs.Root bind:value={currentTab}>
			<Tabs.List class="flex items-center gap-2 text-sm no-drag">
				{#each tabs as tab}
				<Tabs.Trigger value={tab.value} class="no-drag px-2 py-1 text-zinc-500 transition-all data-[state=active]:bg-zinc-200 rounded-sm data-[state=active]:dark:bg-zinc-700 data-[state=active]:text-current">{tab.label}</Tabs.Trigger>
				{/each}
			</Tabs.List>
		</Tabs.Root>
	</div>
	<div class="flex items-center no-drag">

		<button on:click={back} class="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-2 rounded-md transition-all">
			<ArrowLeft size="16"/>
		</button>
		<button on:click={refresh} class="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-2 rounded-md transition-all">
			<RotateCw size="14" />
		</button>
		
	</div>
    <div class="flex-grow flex gap-0.5 items-center text-left text-xs text-zinc-600 dark:text-zinc-300">
		
		<img src={YTICON} alt="youtube.com" class="h-[20px]">
		{urlD}
	
	
	</div>
    <div class="options no-drag">
      <div class="flex items-center">
        <Toggle.Root bind:pressed={$rpcActive} class="p-1.5 transition-all rounded-md drop-shadow-sm flex items-center data-[state=on]:bg-neutral-300 data-[state=on]:dark:bg-neutral-700 data-[state=on]:invert-0 [&[data-state=off]>img]:saturate-0 [>img]:dark:brightness-200">
          <img src={DiscordIcon} alt="Discord" class="w-4 h-4 wow drop-shadow-xl transition-all dark:invert">
        </Toggle.Root>
        
      </div>
    </div>
  </div>
  <div class="flex-grow flex items-center justify-center">
	<Spinner />
  </div>
</div>


<style>
  .drag {
    -webkit-app-region: drag
  }
  .no-drag {
    -webkit-app-region: no-drag
  }
  .wow {
    filter: invert(48%) sepia(58%) saturate(5406%) hue-rotate(221deg) brightness(95%) contrast(100%);
  }
  img {
    fill: currentColor;
  }
</style>
