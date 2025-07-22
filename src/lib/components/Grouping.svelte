<script lang="ts">
	let { text = '' }: { text: string } = $props();

	const colors = [
		'text-sky-500 dark:text-sky-400',
		'text-emerald-500 dark:text-emerald-400',
		'text-amber-500 dark:text-amber-400',
		'text-rose-500 dark:text-rose-400',
		'text-violet-500 dark:text-violet-400'
	];

	type Part = { text: string; depth: number };

	function createParts(inputText: string): Part[] {
		let processedText = inputText.trim();

		if (processedText.startsWith('(') && processedText.endsWith(')')) {
			let balance = 0;
			let whollyEnclosed = true;
			for (let i = 1; i < processedText.length - 1; i++) {
				if (processedText[i] === '(') {
					balance++;
				} else if (processedText[i] === ')') {
					balance--;
				}
				if (balance < 0) {
					whollyEnclosed = false;
					break;
				}
			}

			if (whollyEnclosed && balance === 0) {
				processedText = processedText.slice(1, -1);
			}
		}

		const parts: Part[] = [];
		let currentDepth = -1;
		let buffer = '';

		for (const char of processedText) {
			if (char === '(') {
				if (buffer) parts.push({ text: buffer, depth: currentDepth });
				buffer = '';
				currentDepth++;
				parts.push({ text: '(', depth: currentDepth });
			} else if (char === ')') {
				if (buffer) parts.push({ text: buffer, depth: currentDepth });
				buffer = '';
				parts.push({ text: ')', depth: currentDepth });
				currentDepth--;
			} else {
				buffer += char;
			}
		}
		if (buffer) parts.push({ text: buffer, depth: currentDepth });
		return parts;
	}

	let parts = $derived(createParts(text));
</script>

{#each parts as part}
	{#if part.depth > -1}
		<span class={colors[part.depth % colors.length]}>{part.text}</span>
	{:else}
		{part.text}
	{/if}
{/each}
