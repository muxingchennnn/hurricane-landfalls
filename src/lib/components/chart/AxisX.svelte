<script>
	export let areaScaleX;
	export let margin;

	let xTicks = [1851, 1870, 1890, 1910, 1930, 1950, 1970, 1990, 2015];
</script>

<g class="axis-x">
	{#each xTicks as tick, index}
		<g class="tick" transform="translate({areaScaleX(tick)} 0)">
			<text
				class="fill-foreground text-sm font-extralight"
				y={-16}
				dominant-baseline="middle"
				text-anchor="left">{tick}</text
			>
			<line x1="0" x2="0" y1="-8" y2="0" class="stroke-foreground" />
			<!-- {#if index === 0 || index === xTicks.length - 1}
				<line x1="0" x2="0" y1="0" y2="150" class="stroke-foreground" />
			{:else}
				<line x1="0" x2="0" y1="0" y2="8" class="stroke-foreground" />
			{/if} -->
		</g>
	{/each}
	<text
		class="fill-foreground text-sm"
		transform="translate({areaScaleX(2015)} 0)"
		y={-32}
		dominant-baseline="middle"
		text-anchor="left">Year &rarr;</text
	>
</g>

<style>
</style>
