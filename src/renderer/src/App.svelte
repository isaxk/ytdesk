
<script lang="ts">
  import { Toggle } from "bits-ui";
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
    urlD = url.replace("https://www.youtube.com", "");
  })

  function back(): void {
	window.electron.ipcRenderer.send("back");
  }

  function refresh(): void {
	window.electron.ipcRenderer.send("refresh");
  }
</script>


<div class="flex flex-col h-[100vh] bg-zinc-50 dark:bg-neutral-950 dark:text-white">
  <div class="flex drag items-center pr-[10px] box-border h-[37px] w-full drop-shadow gap-3">
    <div class="w-[70px]"></div>
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
        <Toggle.Root bind:pressed={$rpcActive} class="p-2 transition-all rounded-md drop-shadow-sm flex items-center data-[state=on]:bg-neutral-300 data-[state=on]:dark:bg-neutral-800 data-[state=on]:invert-0 [&[data-state=off]>img]:saturate-0 [>img]:dark:brightness-200">
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
