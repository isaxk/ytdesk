<script lang="ts">
    export let is: "win32"|"darwin"|"linux";
</script>

{#if is == window.electron.process.platform}
<slot />
{/if}