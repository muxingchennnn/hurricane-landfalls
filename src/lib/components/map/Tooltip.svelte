<script>
	export let hoveredData;
	export let projection;
	import { fade } from 'svelte/transition';

	// $: console.log(hoveredData)
	let xNudge = 16;
	let yNudge = 8;
	$: x = projection([+hoveredData.Longtitude, +hoveredData.Latitude])[0] + xNudge;
	$: y = projection([+hoveredData.Longtitude, +hoveredData.Latitude])[1] + yNudge;

	// $: console.log(x,y)

	$: console.log(hoveredData);
</script>

{#if hoveredData?.ID}
	<div
		class="tooltip"
		style="left: {x}px; top: {y}px"
		transition:fade={{ delay: 250, duration: 300 }}
	>
		<h1>{hoveredData.Name}</h1>
		<h2>Date: {hoveredData.Date}</h2>
		<h2>Speed: {hoveredData.Knots} kt</h2>
		{#if +hoveredData.Category === 0}
			<h2>Category: TS</h2>
		{:else if +hoveredData.Category > 0}
			<h2>Category: {hoveredData.Category}</h2>
		{/if}

		<!-- {#if hoveredData.Category === 0}
			<span style="background-color: #808080">{hoveredData.Category}</span>
		{:else if hoveredData.Category > 0 && hoveredData.Category < 3}
			<span style="background-color: #5185A1">{hoveredData.Category}</span>
		{:else if hoveredData.Category >= 3}
			<span style="background-color: #C5284D">{hoveredData.Category}</span>
		{/if} -->
	</div>
{/if}

<style>
	.tooltip {
		position: absolute;
		color: black;

		padding: 8px 6px;
		background: white;
		box-shadow: rgba(0, 0, 0, 0.15) 2px 3px 8px;
		border-radius: 3px;
		pointer-events: none;
		transition:
			top 300ms ease,
			left 300ms ease;
	}

	h1 {
		font-size: 1rem;
		font-weight: 500;
		margin-bottom: 6px;
		width: 100%;
	}

	h2 {
		font-size: 0.8rem;
		font-weight: 300;
		/* text-transform: uppercase; */
	}

	span {
		font-size: 80%;
		margin-left: 2px;
		padding: 2px 4px;
		display: inline-block;
		vertical-align: bottom;
		border-radius: 3px;
		color: rgba(0, 0, 0, 0.7);
	}
</style>
