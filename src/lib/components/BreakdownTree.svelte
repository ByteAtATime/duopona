<script lang="ts">
	import type { BreakdownItem } from '$lib/types';
	import BreakdownTree from './BreakdownTree.svelte';

	let { node }: { node: BreakdownItem } = $props();

	const firstChildStyles =
		"before:absolute before:top-[-24px] before:left-0 before:w-1/2 before:h-px before:bg-background before:content-['']";

	const lastChildStyles =
		"after:absolute after:top-[-24px] after:right-0 after:h-px after:w-1/2 after:bg-background after:content-['']";
</script>

<div class="inline-flex flex-col items-center">
	<div class="z-10 w-full max-w-xs rounded-md border bg-card p-3 text-card-foreground shadow-sm">
		<h4 class="font-bold">{node.term}</h4>
		<dl class="mt-1 space-y-0.5 text-xs">
			{#if node.literal}
				<div>
					<dt class="font-semibold text-muted-foreground">Literal Meaning</dt>
					<dd class="ml-2.5">{node.literal}</dd>
				</div>
			{/if}
			<div>
				<dt class="font-semibold text-muted-foreground">Conceptual Meaning</dt>
				<dd class="ml-2.5">{node.conceptual}</dd>
			</div>
		</dl>
	</div>

	{#if node.children && node.children.length > 0}
		<div class="h-6 w-px bg-border"></div>

		<div class="relative">
			<div class="absolute top-0 right-0 left-0 h-px bg-border"></div>

			<div class="flex items-start justify-center gap-x-4 pt-6">
				{#each node.children as child, i}
					<div
						class="
                            relative
                            {node.children.length > 1 && i === 0 ? firstChildStyles : ''}
                            {node.children.length > 1 && i === node.children.length - 1
							? lastChildStyles
							: ''}
                        "
					>
						{#if node.children.length > 1}
							<div class="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-border"></div>
						{/if}
						<BreakdownTree node={child} />
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
