<script>
	import * as d3 from 'd3';
	export let margin;
	export let ctnHeight;

	const colorLegendWidth = 800;
	const colorLegendHeight = 40;
	const legendMargin = 0;
	const legendSpacing = 20;

	const colorLegendCategories = [
		'Major hurricanes (categroy 3, 4, and 5)',
		'Other hurricanes (category 1, 2, and tropical storms)'
	];

	const colorLegendSacle = d3
		.scaleOrdinal()
		.domain(colorLegendCategories)
		.range(['#C5284D', '#5185A1']);
</script>

<svg
	class="color-legend"
	width={colorLegendWidth}
	height={colorLegendHeight}
	transform="translate({margin.left},{-ctnHeight - 16})"
>
	{#each colorLegendCategories as category, i}
		<circle
			cx={legendMargin + 5}
			cy={legendMargin + i * legendSpacing + 10}
			r={5}
			fill={colorLegendSacle(category)}
		/>
		<text
			class="fill-foreground text-sm"
			x={legendMargin + 20}
			y={legendMargin + i * legendSpacing + 15}>{category}</text
		>
	{/each}
</svg>

<style>
	.color-legend {
		position: absolute;
		bottom: 0;
	}
</style>
