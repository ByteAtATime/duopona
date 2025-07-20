<script lang="ts">
	type Node = string | Node[];
	let { node, depth }: { node: Node; depth: number } = $props();

	const colors = [
		'text-sky-500 dark:text-sky-400',
		'text-emerald-500 dark:text-emerald-400',
		'text-amber-500 dark:text-amber-400',
		'text-rose-500 dark:text-rose-400',
		'text-violet-500 dark:text-violet-400'
	];
</script>

{#if typeof node === 'string'}
	{node}
{:else if Array.isArray(node)}
	<span class={colors[depth % colors.length]}>
		({#each node as child}
			<svelte:self node={child} depth={depth + 1} />
		{/each})
	</span>
{/if}
