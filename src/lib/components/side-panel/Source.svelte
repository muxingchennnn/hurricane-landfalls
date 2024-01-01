<script>
	import { IconArrowUpRight } from '@tabler/icons-svelte';
	export let author;
	export let href;
	export let title;
</script>

<p>
	- {author},
	<a {href} class="align-middle"
		>{title}<span><IconArrowUpRight class="inline" size={16} /></span></a
	>
</p>
