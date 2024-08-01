<script lang="ts">
	export let title: string;
	export let description: string;
</script>

<div class="p-5 flex flex-col gap-2">
	<div class="text-3xl font-medium">{title}</div>
	<div class="text-md">{description}</div>
</div>
