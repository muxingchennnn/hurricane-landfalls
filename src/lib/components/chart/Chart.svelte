<script>
	import * as d3 from 'd3';
	import AxisX from './AxisX.svelte';
	import AxisY from './AxisY.svelte';
	import StackedArea from './StackedArea.svelte';
	import Brush from './Brush.svelte';
	import BrushCopy from './BrushCopy.svelte';
	import StackedBar from './StackedBar.svelte';
	import ColorLegend from '../legend/ColorLegend.svelte';
	import TraceLegend from '../legend/TraceLegend.svelte';
	import { chartOption } from '$lib/store';

	export let aggregateData;

	const margin = { top: 40, right: 80, bottom: 0, left: 80 };

	// let ctnWidth = window.chartWidth
	let ctnWidth = 1500;
	let ctnHeight = window.innerHeight * 0.12;
	$: chartWidth = ctnWidth - margin.left - margin.right;
	$: chartHeight = ctnHeight - margin.top - margin.bottom;

	const stack = d3.stack().keys(['minor_count', 'major_count']);
	const stackColor = ['#5185A1', '#C5284D'];
	$: colorScale = d3
		.scaleOrdinal()
		.domain(['minor_count', 'major_count'])
		.range(['#5185A1', '#C5284D']);

	$: stackedData = stack(aggregateData);
	// $: console.log({stackedData})

	$: domainMin = d3.min(aggregateData, (d) => d.year);
	$: domainMax = d3.max(aggregateData, (d) => d.year);

	$: areaScaleX = d3.scaleLinear().domain([domainMin, domainMax]).range([0, chartWidth]);

	$: areaScaleY = d3
		.scaleLinear()
		.domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])])
		.range([chartHeight, 0]);

	$: areaGenerator = d3
		.area()
		.curve(d3.curveBasis)
		// .curve(d3.curveCardinal)
		.x((d) => areaScaleX(d.data.year))
		.y0((d) => areaScaleY(d[0]))
		.y1((d) => areaScaleY(d[1]));

	// $: console.log(chartWidth, chartHeight);

	$: barScaleX = d3
		.scaleBand()
		.domain(aggregateData.map((d) => d.year))
		.range([0, chartWidth])
		.padding(0.1);
	$: barScaleY = areaScaleY;
</script>

<div class="chart-container" bind:clientWidth={ctnWidth}>
	<svg width={ctnWidth} height={ctnHeight}>
		<g transform="translate({margin.left} {margin.top})">
			<AxisX {areaScaleX} {margin} />
			<AxisY {areaScaleY} {margin} {chartWidth} />
			{#if $chartOption === 'area'}
				<StackedArea {stackedData} {areaGenerator} {stackColor} />
			{:else if $chartOption === 'bar'}
				<StackedBar {stackedData} {stackColor} {barScaleX} {barScaleY} />
			{/if}
			<!-- <Brush {chartWidth} {chartHeight} {aggregateData} {areaScaleX} /> -->
			<BrushCopy {chartWidth} {chartHeight} {aggregateData} {areaScaleX} />
		</g>
	</svg>
	<ColorLegend {margin} {ctnHeight} />
	<TraceLegend {margin} {ctnHeight} />
</div>

<style>
	.chart-container {
		position: absolute;
		width: 100%;
		bottom: 0;
		z-index: 999;
	}
</style>
