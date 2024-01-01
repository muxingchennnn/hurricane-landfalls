<script>
	import { fade } from 'svelte/transition';

	export let stackedData;
	export let areaGenerator;
	export let stackColor;
</script>

<g class="area-chart" transition:fade>
	{#each stackedData as area, i}
		<g class="area-path">
			<path d={areaGenerator(area)} fill={stackColor[i]} />
		</g>
	{/each}
</g>
