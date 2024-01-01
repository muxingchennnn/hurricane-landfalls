<script>
	import * as d3 from 'd3';
	import { brushLowerBound, brushUpperBound } from '$lib/store';

	export let chartWidth;
	export let chartHeight;
	export let aggregateData;
	export let areaScaleX;

	$: console.log($brushLowerBound);
	$: console.log(areaScaleX.invert);

	function d3Brush(node, { width, height }) {
		const brush = d3
			.brushX()
			.extent([
				[0, 0],
				[width, height]
			])
			.on('start brush end', brushed);
		d3.select(node).call(brush).on('dblclick', dblclicked);

		function dblclicked() {
			// const selection = d3.brushSelection(this) ? null : areaScaleX.range();
			// console.log(d3.brushSelection(this));
			const selection = null;
			d3.select(this).call(brush.move, selection);
			// [$brushLowerBound, $brushUpperBound] = selection.map(areaScaleX.invert);
			$brushLowerBound = areaScaleX.domain()[0];
			$brushUpperBound = areaScaleX.domain()[1];
		}

		return {
			update({ width, height }) {
				brush.extent([
					[0, 0],
					[width, height]
				]);
				d3.select(node).call(brush).on('dblclick', dblclicked);
			},
			destroy() {
				// Clean up when the element is removed
				brush.on('start brush end', null);
			}
		};
	}

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
</script>

<g class="brush" use:d3Brush={{ width: chartWidth, height: chartHeight }}></g>
