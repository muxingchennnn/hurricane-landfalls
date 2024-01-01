<script>
	import * as d3 from 'd3';
	import { fade } from 'svelte/transition';
	import { brushLowerBound, brushUpperBound } from '$lib/store';

	export let usLandfalls;
	export let projection;
	export let width;
	export let height;
	export let bandwidth;
	export let threshold;

	// let bandwidth = 20
	// let threshold = 20

	$: contour = d3
		.contourDensity()
		.x((d) => projection([+d.Longtitude, +d.Latitude])[0])
		.y((d) => projection([+d.Longtitude, +d.Latitude])[1])
		.size([width, height])
		.bandwidth($bandwidth)
		.thresholds($threshold);

	$: contourPath = d3.geoPath();

	$: dataBrushed = usLandfalls.filter((d) => {
		return d.Year >= parseInt($brushLowerBound) && d.Year <= parseInt($brushUpperBound);
	});
	$: contoursData = contour(dataBrushed);

	$: contourColorScale = d3
		.scaleOrdinal()
		.domain(contoursData.map((d) => d.value))
		.range(d3.quantize(d3.interpolatePurples, contoursData.map((d) => d.value).length));
</script>

<g class="contours" fill="none" transition:fade>
	{#each contoursData as contour}
		<g class="contour-path">
			<path
				d={contourPath(contour)}
				fill={contourColorScale(contour.value)}
				stroke="#eeeeee"
				opacity={0.1}
			/>
		</g>
	{/each}
</g>
