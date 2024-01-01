<script>
	import * as d3 from 'd3';
	import Map from '../lib/components/map/Map.svelte';
	import Chart from '../lib/components/chart/Chart.svelte';
	import SidePanel from '../lib/components/side-panel/SidePanel.svelte';

	export let data;

	const {
		landfallData,
		countryData,
		stateData,
		countries,
		countryBorders,
		usBorder,
		stateBorders,
		usLandfalls,
		aggregateData
	} = data;
</script>

<main>
	<main>
		<Map {countries} {countryBorders} {stateBorders} {usBorder} {landfallData} {usLandfalls} />
		<Chart {aggregateData} />
		<SidePanel />
	</main>
</main>
