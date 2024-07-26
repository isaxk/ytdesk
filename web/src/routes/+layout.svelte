<script lang="ts">
    import "../app.css";
</script>

<slot />

<style lang="postcss">
    :global(body) {
        @apply bg-zinc-900 text-white overflow-x-hidden;
    }
    * {
        @apply overflow-x-hidden;
    }
</style>