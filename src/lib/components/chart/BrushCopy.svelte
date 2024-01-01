<script>
	import * as d3 from 'd3';
	import { brushLowerBound, brushUpperBound } from '$lib/store';
	import { onMount } from 'svelte';

	export let chartWidth;
	export let chartHeight;
	export let aggregateData;
	export let areaScaleX;

	$: console.log(chartWidth);

	// $: console.log($brushLowerBound);
	// $: console.log(chartScaleX.invert);

	let brushEl;

	$: brush = d3
		.brushX()
		.extent([
			[0, 0],
			[chartWidth, chartHeight]
		])
		.on('start brush end', brushed);

	$: console.log({ brush });

	$: {
		if (brushEl) {
			brushEl.call(brush);
			brushEl.call(brush.move, null);
			$brushLowerBound = areaScaleX.domain()[0];
			$brushUpperBound = areaScaleX.domain()[1];
		}
	}

	onMount(() => {
		brushEl = d3.select('.brush');
	});

	function brushed({ sourceEvent, selection }) {
		// console.log({ sourceEvent });
		// console.log({ selection });
		if (!sourceEvent) return;
		if (selection !== null) {
			[$brushLowerBound, $brushUpperBound] = selection.map(areaScaleX.invert);
			// console.log(lowerBound, parseInt(lowerBound))
			// console.log(upperBound, parseInt(upperBound))
		} else if (selection === null) {
			$brushLowerBound = areaScaleX.domain()[0];
			$brushUpperBound = areaScaleX.domain()[1];
		}
	}

	function handleDblclick() {
		// const selection = d3.brushSelection(this) ? null : areaScaleX.range();
		const selection = null;
		d3.select(this).call(brush.move, selection);
		$brushLowerBound = areaScaleX.domain()[0];
		$brushUpperBound = areaScaleX.domain()[1];
	}
</script>

<g class="brush" on:dblclick={handleDblclick}></g>
