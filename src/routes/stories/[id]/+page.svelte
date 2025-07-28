<script lang="ts">
	import { matchLines, tokenizeTokiPona } from '$lib/translations.js';
	import * as HoverCard from '$lib/components/ui/hover-card';

	const { data } = $props();
	const { story } = data;

	const lines = matchLines(story);

	type RenderableToken = {
		text: string;
		isWord: boolean;
		definition?: string[];
	};

	function createRenderableLine(line: string): RenderableToken[] {
		const wordTokens = tokenizeTokiPona(line);
		if (wordTokens.length === 0) return [{ text: line, isWord: false, definition: undefined }];

		const renderableTokens: RenderableToken[] = [];
		let currentIndex = 0;

		for (const token of wordTokens) {
			const phrase = token.phrase;

			const phraseRegex = new RegExp(phrase.split(' ').join('\\s+'), 'i');
			const match = line.substring(currentIndex).match(phraseRegex);

			if (match) {
				const matchIndex = match.index ?? 0;
				const fullStartIndex = currentIndex + matchIndex;
				const matchedText = match[0];

				if (fullStartIndex > currentIndex) {
					renderableTokens.push({
						text: line.substring(currentIndex, fullStartIndex),
						isWord: false,
						definition: undefined
					});
				}

				renderableTokens.push({
					text: matchedText,
					isWord: true,
					definition: token.definition
				});

				currentIndex = fullStartIndex + matchedText.length;
			}
		}

		if (currentIndex < line.length) {
			renderableTokens.push({
				text: line.substring(currentIndex),
				isWord: false,
				definition: undefined
			});
		}

		return renderableTokens;
	}
</script>

{#snippet renderTokiPonaLine(text: string)}
	{#if text.trim()}
		<div class="prose max-w-none leading-relaxed">
			{#each createRenderableLine(text) as token}
				{#if token.isWord && token.definition}
					<HoverCard.Root openDelay={0} closeDelay={0}>
						<HoverCard.Trigger class="cursor-pointer">{token.text}</HoverCard.Trigger
						><HoverCard.Content side="bottom">
							<p class="font-bold">{token.text}</p>
							{#each token.definition.slice(0, 3) as def, i}
								{i !== 0 ? ', ' : ''}{def}
							{/each}
						</HoverCard.Content>
					</HoverCard.Root>
				{:else}
					<span>{token.text}</span>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="h-2 md:h-8"></div>
	{/if}
{/snippet}

{#snippet renderSimpleLine(text: string)}
	{#if text.trim()}
		<div class="prose max-w-none leading-relaxed">
			<p>{@html text.replace(/\n/g, '<br/>')}</p>
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
					{@render renderTokiPonaLine(line.toki)}
				</td>
				<td class="block pr-6 pl-12 md:table-cell md:py-1 md:pl-6">
					{@render renderSimpleLine(line.literal)}
				</td>
				<td class="block pr-6 pl-12 md:table-cell md:py-1 md:pl-6">
					{@render renderSimpleLine(line.original)}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
