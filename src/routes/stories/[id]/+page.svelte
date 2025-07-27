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
		<div class="h-2 md:h-8"></div>
	{/if}
{/snippet}

<table class="mx-auto my-12 w-full md:table md:w-auto">
	<thead class="hidden md:table-header-group">
		<tr>
			<th class="px-6 py-1">Toki Pona</th>
			<th class="px-6 py-1">Literal Translation</th>
			<th class="px-6 py-1">Original</th>
		</tr>
	</thead>
	<tbody class="block md:table-row-group">
		{#each lines as line}
			<tr class="mt-2 block hover:bg-muted md:table-row">
				<td class="block px-6 md:table-cell md:py-1">
					{@render renderLine(line.toki)}
				</td>
				<td class="block pr-6 pl-12 md:table-cell md:py-1 md:pl-6">
					{@render renderLine(line.literal)}
				</td>
				<td class="block pr-6 pl-12 md:table-cell md:py-1 md:pl-6">
					{@render renderLine(line.original)}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
