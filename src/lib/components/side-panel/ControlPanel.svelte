<script>
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import RangeInput from './RangeInput.svelte';
	import { dotSize, dotOpacity, bandwidth, threshold, mapOption, chartOption } from '$lib/store';

	// $: console.log($mapOption);
	// $: console.log($chartOption);
</script>

<Accordion.Item value="item-2">
	<Accordion.Trigger>Control panel</Accordion.Trigger>
	<Accordion.Content>
		<div class="flex flex-col gap-8">
			<!-- map controls -->
			<Tabs.Root bind:value={$mapOption} class="w-[400px]">
				<div>
					<p class="mb-2">
						<img src="/map.svg" alt="Icon" class="mr-1 inline" width="{30}}" />Spatial distribution
						of landfalls represented via:
					</p>
					<Tabs.List class="w-full">
						<Tabs.Trigger value="dots" class="w-full">Dot Map</Tabs.Trigger>
						<Tabs.Trigger value="contours" class="w-full">Contour Map</Tabs.Trigger>
					</Tabs.List>
				</div>
				<Tabs.Content value="dots" class="mt-3 border-l border-foreground pl-4">
					<div class="flex flex-col gap-4">
						<RangeInput label={'Dot size'} step={1} max={16} storeName={dotSize} />
						<RangeInput label={'Dot opacity'} step={0.05} max={1} storeName={dotOpacity} />
						<!-- <Button>Clear Tracks</Button> -->
					</div>
				</Tabs.Content>
				<Tabs.Content value="contours" class="mt-3 border-l border-foreground pl-4">
					<div class="flex flex-col gap-4">
						<RangeInput label={'Bandwidth'} step={1} min={1} max={50} storeName={bandwidth} />
						<RangeInput label={'Threshold'} step={1} min={1} max={50} storeName={threshold} />
					</div>
				</Tabs.Content>
			</Tabs.Root>

			<!-- chart controls -->
			<Tabs.Root bind:value={$chartOption} class="w-[400px]">
				<div>
					<p class="mb-2">
						<img src="/chart.svg" alt="Icon" class="mr-1 inline" width={24} />Temporal distribution
						of landfalls represented via:
					</p>
					<Tabs.List class="w-full">
						<Tabs.Trigger value="area" class="w-full">Area Chart</Tabs.Trigger>
						<Tabs.Trigger value="bar" class="w-full">Bar Chart</Tabs.Trigger>
					</Tabs.List>
				</div>
			</Tabs.Root>
		</div>
	</Accordion.Content>
</Accordion.Item>

<style>
	input {
		accent-color: #9dcff8;
	}
</style>
