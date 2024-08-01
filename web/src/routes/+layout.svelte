<script lang="ts">
	import '../app.css';
</script>

<slot />

<style lang="postcss">
	:global(body) {
		@apply overflow-x-hidden bg-zinc-900 text-white;
	}
	* {
		@apply overflow-x-hidden;
	}
</style>
ƒ