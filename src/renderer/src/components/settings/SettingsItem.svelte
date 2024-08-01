<script lang="ts">
	export let label: string;
	export let requiredRestart: boolean = false;
</script>

<div class="flex h-14 w-full items-center gap-6">
	<div class="flex-grow">
		<div class="text-lg">{label}:</div>
		{#if requiredRestart}
			<div class="text-sm text-gray-400 dark:text-zinc-500">Required Restart</div>
		{/if}
	</div>
	<div class="flex justify-end">
		<slot />
	</div>
</div>
