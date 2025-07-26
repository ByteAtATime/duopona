<script lang="ts">
	import Markdown from 'svelte-exmarkdown';
	import remarkBreaks from 'remark-breaks';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import { matchLines } from '$lib/translations.js';

	const { data } = $props();
	const { story } = data;

	const plugins = [gfmPlugin(), { remarkPlugin: remarkBreaks }];

	const lines = matchLines(story);
</script>

{#each lines as line}
	<Markdown md={line.toki} {plugins} />
	<Markdown md={line.original} {plugins} />
	<Markdown md={line.literal} {plugins} />
	<hr />
{/each}
