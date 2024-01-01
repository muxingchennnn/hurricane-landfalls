<script>
	export let areaScaleY;
	export let margin;
	export let chartWidth;

	// $: yTicks = areaScaleY.ticks(3);
	const yTicks = [2, 6];

	$: console.log(yTicks);
</script>

<g class="axis-y">
	{#each yTicks as tick}
		<g class="tick" transform="translate(0 {areaScaleY(tick)})">
			<text
				class="fill-foreground text-sm font-extralight"
				x={-16}
				y={0}
				dominant-baseline="middle"
				text-anchor="middle">{tick}</text
			>
			{#if tick === 2 || tick === 6}
				<line x1="0" x2={chartWidth} y1="0" y2="0" class="stroke-gray-400 stroke-[0.5px]" />
			{/if}
		</g>
	{/each}
</g>

<style>
</style>
