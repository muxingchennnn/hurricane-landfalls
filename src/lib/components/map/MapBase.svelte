<script>
	export let width;
	export let height;
	export let countries;
	export let countryBorders;
	export let stateBorders;
	export let usBorder;
	export let path;
</script>

<!-- ocean -->
<rect class="ocean" x="0" y="0" {width} {height} fill="#171717" />
<!-- countries -->
<g class="countries">
	{#each countries as country}
		<path d={path(country)} fill="#000000" stroke="none" />
	{/each}
</g>
<!-- countryBorders -->
<g class="countryBorders">
	<path d={path(countryBorders)} fill="none" stroke="#999999" stroke-width="0.3" />
</g>
<!-- states countryBorders -->
<g class="state-countryBorders">
	<path d={path(stateBorders)} fill="none" stroke="#999999" stroke-width="0.3" />
</g>
<!-- us border -->
<g class="us-border">
	<path d={path(usBorder)} fill="none" stroke="#eeeeee" stroke-width="0.5" />
</g>
