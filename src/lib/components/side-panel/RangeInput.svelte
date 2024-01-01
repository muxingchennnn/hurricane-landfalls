<script>
	import { Slider } from '$lib/components/ui/slider';
	import { Badge } from '$lib/components/ui/badge';
	import { onMount } from 'svelte';
	import { Range, Label } from 'flowbite-svelte';

	export let label;
	export let min;
	export let max;
	export let step;
	export let storeName;

	// let storeValue;
	// $: currentValue = [$storeName];
	// onMount(async () => {
	// 	if (typeof storeName !== 'undefined') {
	// 		const storeModule = await import('$lib/store');
	// 		storeValue = storeModule[storeName];
	// 		// $storeValue = 8;
	// 	}
	// });

	// $: console.log(storeValue);
	// $: console.log($storeValue);
	// $storeName = 8;

	// $: console.log($storeValue, value);

	// let currentValue = value;
	// $: $storeValue = currentValue[0];
	// $: $storeValue = currentValue;
	// $: console.log(storeName);
	// $: console.log($storeValue);

	// $: currentValue = typeof storeName !== 'undefined' ? $storeName : value;
</script>

<div class="flex justify-between items-center">
	<span class="text-sm">{label}: <Badge class="py-0.25 px-2">{$storeName}</Badge></span>
	<!-- <Slider bind:value={$storeName} {min} {max} {step} class="w-[60%]" /> -->
	<Range
		bind:value={$storeName}
		{min}
		{max}
		{step}
		class="w-[60%] dark:bg-foreground dark:accent-foreground dark:bg-gray-700 dark:border-"
		size="sm"
	/>
</div>

<style>
	.slider input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		background: white;
	}

	.slider input[type='range']::-moz-range-thumb {
		background: #4caf50;
	}
</style>
