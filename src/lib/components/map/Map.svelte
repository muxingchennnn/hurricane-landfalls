<script>
	import * as d3 from 'd3';
	import { fade } from 'svelte/transition';
	import MapBase from './MapBase.svelte';
	import Tooltip from './Tooltip.svelte';
	import Contour from './Contour.svelte';
	import {
		mapOption,
		dotSize,
		dotOpacity,
		bandwidth,
		threshold,
		brushLowerBound,
		brushUpperBound
	} from '$lib/store';
	import { onMount } from 'svelte';

	export let countries;
	export let countryBorders;
	export let stateBorders;
	export let usBorder;
	export let landfallData;
	export let usLandfalls;

	// $: console.log(parseInt($brushLowerBound));
	// $: console.log(parseInt($brushUpperBound));
	// $: console.log(usLandfallsLoc);

	let width = 1400;
	let height = 900;
	let hoveredData;
	let hoveredPath;
	let animateSpeed = 200;

	$: usLandfallsLoc = usLandfalls
		.filter((d) => d.Event === 'L')
		.filter((d) => {
			return d.Year >= parseInt($brushLowerBound) && d.Year <= parseInt($brushUpperBound);
		});
	$: landfallDataGroupedByID = d3.groups(landfallData, (d) => d.ID);

	// let windowWidth;
	let projTranslation = [2350, 1250];
	let projScale = 1200;

	// onMount(() => {
	// 	windowWidth = window.innerWidth;
	// });
	$: {
		if (width > 1800) {
			projTranslation = [2350, 1250];
			projScale = 1200;
		} else {
			projTranslation = [2100, 1100];
			projScale = 1100;
		}
	}

	$: projection = d3
		.geoMercator()
		.fitSize([width, height], countries)
		.translate(projTranslation)
		.scale(projScale);

	$: lineProjection = d3
		.line()
		.x((d) => projection([d.Longtitude, d.Latitude])[0])
		.y((d) => projection([d.Longtitude, d.Latitude])[1])
		.curve(d3.curveBasis);

	$: path = d3.geoPath().projection(projection);

	// scale for width of the paths
	const strokeWidthScale = d3
		.scaleOrdinal()
		.domain(['0', '1', '2', '3', '4', '5'])
		.range(['1px', '4px', '7px', '10px', '15px', '20px']);

	// scale for color of the paths
	const strokeColorScale = d3
		.scaleOrdinal()
		.domain(['0', '1', '2', '3', '4', '5'])
		.range(['#5185A1', '#5185A1', '#5185A1', '#C5284D', '#C5284D', '#C5284D']);

	function handleMouseOver(dot) {
		hoveredData = dot;
		hoveredPath = landfallDataGroupedByID.find((d) => d[0] === dot.ID);
	}

	$: console.log(hoveredPath);
	$: {
		if (hoveredPath) {
			for (let i = 0; i < hoveredPath[1].length - 1; i++) {
				let dotPair = hoveredPath[1].slice(i, i + 2);
				console.log(dotPair);

				let trace = d3
					.select('.hurricane-trace-animation')
					.append('g')
					.attr('class', 'hurricanePathAnimation')
					.append('path')
					.data(dotPair)
					.join('path')
					.attr('d', lineProjection(dotPair))
					.attr('fill', 'none')
					// .attr('vector-effect', 'non-scaling-stroke')
					.attr('stroke', strokeColorScale(dotPair[0].Category))
					.attr('stroke-width', strokeWidthScale(dotPair[0].Category))
					.attr('stroke-linejoin', 'round')
					.attr('stroke-linecap', 'round');
			}
		}
	}

	function handleClick() {
		if (hoveredPath) {
			const pathData = hoveredPath;
			const delayBetweenIteration = function (ms) {
				return new Promise((res) => {
					setTimeout(() => {
						res('');
					}, ms);
				});
			};

			const pathAnimation = async () => {
				for (let i = 0; i < pathData[1].length - 1; i++) {
					await delayBetweenIteration(animateSpeed);

					let dotPair = pathData[1].slice(i, i + 2);
					console.log(dotPair);

					let trace = d3
						.select('.hurricane-trace-animation')
						.append('g')
						.attr('class', 'hurricanePathAnimation')
						.append('path')
						.data(dotPair)
						.join('path')
						.attr('d', lineProjection(dotPair))
						.attr('fill', 'none')
						// .attr('vector-effect', 'non-scaling-stroke')
						.attr('stroke', strokeColorScale(dotPair[0].Category))
						.attr('stroke-width', strokeWidthScale(dotPair[0].Category))
						.attr('stroke-linejoin', 'round')
						.attr('stroke-linecap', 'round');

					let length = trace.node().getTotalLength();
					trace
						.attr('stroke-dasharray', length + ' ' + length)
						.attr('stroke-dashoffset', length)
						.transition()
						.ease(d3.easeLinear)
						.attr('stroke-dashoffset', 0)
						// .duration(3000)
						// total duration based on the length of the array
						.duration(animateSpeed);
				}
			};
			pathAnimation();
		}
	}

	let tracks;
	$: console.log({ tracks });
	onMount(() => {
		tracks = d3.select('.hurricane-trace-animation');
	});
</script>

<div class="map-container" bind:clientWidth={width} bind:clientHeight={height}>
	<svg id="map" {width} {height}>
		<MapBase {width} {height} {countries} {countryBorders} {usBorder} {stateBorders} {path} />
		{#if $mapOption === 'dots'}
			<!-- {#if hoveredPath}
				<g class="hurricane-trace">
					<path d={lineProjection(hoveredPath[1])} fill="none" stroke="#eeeeee" stroke-width="0.5"
					></path>
				</g>
			{/if} -->
			<g class="hurricane-trace-animation"></g>
			<!-- data points -->
			<g class="dots" transition:fade>
				{#each usLandfallsLoc as dot}
					<circle
						cx={projection([+dot.Longtitude, +dot.Latitude])[0]}
						cy={projection([+dot.Longtitude, +dot.Latitude])[1]}
						fill={dot.Category >= 3 ? '#C5284D' : '#5185A1'}
						r={hoveredData === dot ? 16 : $dotSize}
						opacity={hoveredData ? (hoveredData === dot ? 1 : 0.2) : $dotOpacity}
						on:mouseover={handleMouseOver(dot)}
						on:mouseout={() => {
							hoveredData = null;
							hoveredPath = null;
							d3.selectAll('.hurricanePathAnimation').remove();
						}}
					/>
				{/each}
			</g>
		{:else if $mapOption === 'contours'}
			<!-- contours -->
			<Contour {usLandfalls} {width} {height} {projection} {bandwidth} {threshold} />
		{/if}
	</svg>
	{#if hoveredData}
		<Tooltip {hoveredData} {projection} />
	{/if}
</div>

<style>
	.map-container {
		height: 100vh;
		position: relative;

		overflow: hidden;
	}

	circle {
		transition:
			r 300ms ease,
			opacity 500ms ease;
		cursor: pointer;
	}
</style>
