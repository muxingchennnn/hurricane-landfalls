<script>
	import * as Accordion from '$lib/components/ui/accordion';
	import sourceData from './source';
	import Source from './Source.svelte';
</script>

<Accordion.Item value="item-3">
	<Accordion.Trigger>References</Accordion.Trigger>
	<Accordion.Content>
		{#each sourceData as source}
			<Source {...source} />
		{/each}
	</Accordion.Content>
</Accordion.Item>
