<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import Grouping from './Grouping.svelte';

	let { data }: NodeProps = $props();

	const grouping =
		data.term && data.term.startsWith('(') && data.term.endsWith(')')
			? data.term.substring(1, data.term.length - 1)
			: data.term;
</script>

{#if data.hasParent}
	<Handle type="target" position={Position.Top} />
{/if}
<div class="w-full max-w-xs rounded-md border bg-card p-3 text-card-foreground shadow-sm">
	<h4 class="font-bold">
		<Grouping text={grouping as string} />
	</h4>
	<dl class="mt-1 space-y-0.5 text-xs">
		{#if data.literal}
			<div>
				<dt class="font-semibold text-muted-foreground">Literal Meaning</dt>
				<dd class="ml-2.5">{data.literal}</dd>
			</div>
		{/if}
		<div>
			<dt class="font-semibold text-muted-foreground">Conceptual Meaning</dt>
			<dd class="ml-2.5">{data.conceptual}</dd>
		</div>
	</dl>
</div>
{#if data.hasChildren}
	<Handle type="source" position={Position.Bottom} />
{/if}
