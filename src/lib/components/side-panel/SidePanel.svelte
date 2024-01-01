<script>
	import * as Accordion from '$lib/components/ui/accordion';
	import InteractionGuide from './InteractionGuide.svelte';
	import ControlPanel from './ControlPanel.svelte';
	import Reference from './Reference.svelte';
	import { IconArrowUpRight } from '@tabler/icons-svelte';
</script>

<section class="side-panel flex flex-col gap-4">
	<h1 class="scroll-m-20 text-4xl font-extrabold">
		US hurricane landfalls,<br /> 1851 - 2015
	</h1>
	<a
		class="designer flex items-center"
		href="https://portfolio-site-tawny-mu.vercel.app/"
		target="_blank"
		rel="noopener noreferrer"
		>By Muxing Chen
		<span>
			<IconArrowUpRight class="inline" size={16} />
		</span></a
	>
	<p class="intro">
		This interactive visualization depicts the spatial and temporal distribution of US hurricane
		landfalls from 1851 to 2015, combining a data map and a chart.
	</p>
	<a
		class="data-source"
		href="https://www.kaggle.com/datasets/noaa/hurricane-database"
		target="_blank"
		rel="noopener noreferrer"
	>
		Data source: NOAA, U.S. National Weather Service, U.S. National Hurricane Center<span
			><IconArrowUpRight class="inline" size={16} /></span
		>
	</a>
	<Accordion.Root class="w-full" multiple>
		<InteractionGuide />
		<ControlPanel />
		<Reference />
	</Accordion.Root>
</section>

<style>
	.side-panel {
		position: absolute;
		top: 80px;
		right: 3%;
		width: 400px;
		height: 75vh;
		overflow-y: auto;
	}
</style>
