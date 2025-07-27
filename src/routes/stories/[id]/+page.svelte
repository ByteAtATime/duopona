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

{#snippet renderLine(text: string)}
	{#if text.trim()}
		<div class="prose">
			<Markdown md={text} {plugins} />
		</div>
	{:else}
		<div class="h-8"></div>
	{/if}
{/snippet}

<table class="mx-auto">
	<thead>
		<tr>
			<th class="px-6 py-1">Toki Pona</th>
			<th class="px-6 py-1">Literal Translation</th>
			<th class="px-6 py-1">Original</th>
		</tr>
	</thead>
	<tbody>
		{#each lines as line}
			<tr class="hover:bg-muted">
				<td class="px-6 py-1">
					{@render renderLine(line.toki)}
				</td>
				<td class="px-6 py-1">
					{@render renderLine(line.literal)}
				</td>
				<td class="px-6 py-1">
					{@render renderLine(line.original)}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
