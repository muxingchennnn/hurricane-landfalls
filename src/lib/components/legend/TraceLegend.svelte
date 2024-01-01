<script>
	import * as d3 from 'd3';
	export let margin;
	export let ctnHeight;

	const traceLegendCategories = [
		'TS',
		'Category 1',
		'Category 2',
		'Category 3',
		'Category 4',
		'Category 5'
	];

	const traceLegendWidth = 800;
	const traceLegendHeight = 80;
	const traceLegendLen = 90;

	const pathColorScale = d3
		.scaleOrdinal()
		.domain(traceLegendCategories)
		.range(['#5185A1', '#5185A1', '#5185A1', '#C5284D', '#C5284D', '#C5284D']);

	const pathWidthScale = d3
		.scaleOrdinal()
		.domain(traceLegendCategories)
		.range(['1px', '4px', '7px', '10px', '15px', '20px']);
</script>

<svg
	class="trace-legend"
	width={traceLegendWidth}
	height={traceLegendHeight}
	transform="translate({margin.left},{-ctnHeight - 48})"
>
	{#each traceLegendCategories as category, i}
		<path
			d={`M ${i * traceLegendLen} 50 L ${(i + 1) * traceLegendLen} 50`}
			stroke={pathColorScale(category)}
			stroke-width={pathWidthScale(category)}
			stroke-linejoin={'round'}
			stroke-linecap={'round'}
		/>
		<text class="fill-foreground text-sm" x={i * traceLegendLen + 45} y={30} text-anchor={'middle'}
			>{category}</text
		>
	{/each}
</svg>

<style>
	.trace-legend {
		position: absolute;
		/* width: 20; */
		bottom: 0;
	}
</style>
