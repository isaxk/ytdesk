<script lang="ts">
	import ColorPicker from "svelte-awesome-color-picker";
	export let isDark: boolean;
    export let hex:string = "#FF0000"
    export let key:string;

    function handleChange(e) {
        console.log(e);
        window.electron.ipcRenderer.send("update-config", key, e.detail.hex);
    }
</script>

<ColorPicker
    on:input={handleChange}
    bind:hex
	isAlpha={false}
    label="Choose color"
    position="responsive-x"
    textInputModes={["hex"]}
	--cp-bg-color={isDark?"#262626":"white"}
	--cp-border-color={isDark?"#3f3f46":"#D4D4D8"}
	--cp-text-color={isDark?"white":"black"}
	--cp-input-color={isDark?"#171717":"#f4f4f5"}
	--slider-width="15px"
	--cp-button-hover-color="#777"
/>
