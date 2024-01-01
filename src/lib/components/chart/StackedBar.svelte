<script>
	import { fade } from 'svelte/transition';

	export let stackedData;
	export let stackColor;
	export let barScaleX;
	export let barScaleY;
</script>

<g class="stacked-barchart" transition:fade>
	{#each stackedData as barSeries, i}
		<g class="bar-series" fill={stackColor[i]}>
			{#each barSeries as bar}
				<rect
					x={barScaleX(bar.data.year)}
					y={barScaleY(bar[1])}
					height={barScaleY(bar[0]) - barScaleY(bar[1])}
					width={barScaleX.bandwidth()}
				/>
			{/each}
		</g>
	{/each}
</g>
