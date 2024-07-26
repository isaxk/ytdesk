<script lang="ts">

	import { Minus, Square, X } from "lucide-svelte";
	import IconButton from "./IconButton.svelte";

    function emmit(message:string) {
        window.electron.ipcRenderer.send("window-control", message);
    }

</script>
<div class="windows no-drag flex text-sm pl-2 ml-2 [>button]:w-10 border-l-[1px] border-zinc-400 dark:border-zinc-700">
    <IconButton on:click={()=>emmit("minimize")} icon={Minus} iconSize={17}/>
    <IconButton on:click={()=>emmit("maximize")} icon={Square}/>
    <IconButton on:click={()=>emmit("close")} icon={X} iconSize={18}/>
</div>