<script>
	import * as Accordion from '$lib/components/ui/accordion';
	import { Badge } from '$lib/components/ui/badge';
</script>

<Accordion.Item value="item-1">
	<Accordion.Trigger>Interact with the explorer</Accordion.Trigger>
	<Accordion.Content>
		<p>
			1. &nbsp;<Badge class="py-0.25 px-1.5">Hover</Badge>&nbsp; over the dots to get information
			about the specific hurricane.
		</p>
		<p>
			2. &nbsp;<Badge class="py-0.25 px-1.5">Brush</Badge>&nbsp; the chart at the bottom to filter
			hurricanes within a specific time span.
		</p>
	</Accordion.Content>
</Accordion.Item>
