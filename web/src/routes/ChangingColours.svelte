<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { fade } from "svelte/transition";

    const list = [
        "blue",
        "green",
        "purple",
        "yellow",
    ];

    let activeIndex:number = 0;
    let interval: any;

    onMount(()=>{
        interval = setInterval(()=>{
            if(activeIndex===3) {
                activeIndex = 0;
            }
            else {
                activeIndex = activeIndex+1;
            }
            console.log(activeIndex);
        }, 5000)
    });

    onDestroy(()=>{
        clearInterval(interval);
    })
</script>

<div class="relative w-1/2">
    {#key activeIndex}
        <img src="/theming/{list[activeIndex]}.png" alt="Themed client" class="absolute w-full top-0 right-0" transition:fade/>
    {/key}
</div>