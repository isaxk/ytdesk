<script lang="ts">
	import Coloris from "@melloware/coloris";
	import { onMount } from "svelte";

	onMount(() => {
		Coloris.init();
		Coloris({ el: "#picker", alpha: false });
	});
</script>

<div id="picker"></div>
