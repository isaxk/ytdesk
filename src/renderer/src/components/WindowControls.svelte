<script lang="ts">

	import { Minus, Square, X } from "lucide-svelte";

    function emmit(message:string) {
        window.electron.ipcRenderer.send("window-control", message);
    }

</script>
<div class="windows no-drag flex text-sm pl-2 [>button]:w-10">
    <button class="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800" on:click={()=>emmit("minimize")}>
        <Minus size={17}/>
    </button>
    <button class="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800" on:click={()=>emmit("maximize")}>
        <Square size={17}/>
    </button>
    <button class="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800" on:click={()=>emmit("close")}>
        <X size={17}/>
    </button>
</div>