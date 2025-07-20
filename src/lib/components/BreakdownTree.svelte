<script lang="ts">
	import { SvelteFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import type { BreakdownItem } from '$lib/types';
	import CustomNode from './CustomNode.svelte';
	import dagre from 'dagre';

	let { root }: { root: BreakdownItem } = $props();

	const nodeTypes = {
		custom: CustomNode
	};

	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	dagreGraph.setGraph({ rankdir: 'TB' });

	const initialNodes: Node[] = [];
	const initialEdges: Edge[] = [];

	function processNode(node: BreakdownItem, parentId?: string) {
		const id = node.term; // Assuming term is unique
		initialNodes.push({
			id,
			type: 'custom',
			data: {
				term: node.term,
				literal: node.literal,
				conceptual: node.conceptual,
				hasParent: !!parentId,
				hasChildren: !!node.children?.length
			},
			position: { x: 0, y: 0 } // Dagre will set the position
		});

		if (parentId) {
			initialEdges.push({
				id: `${parentId}-${id}`,
				source: parentId,
				target: id
			});
		}

		if (node.children) {
			node.children.forEach((child) => processNode(child, id));
		}
	}

	processNode(root);

	initialNodes.forEach((node) => {
		dagreGraph.setNode(node.id, { width: 320, height: 150 }); // Approximate dimensions for layout
	});

	initialEdges.forEach((edge) => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	let nodes = $state.raw(
		initialNodes.map((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			node.position = {
				x: nodeWithPosition.x - nodeWithPosition.width / 2,
				y: nodeWithPosition.y - nodeWithPosition.height / 2
			};
			return node;
		})
	);

	let edges = $state.raw(initialEdges);
</script>

<div class="w-full self-stretch">
	<SvelteFlow
		bind:nodes
		bind:edges
		{nodeTypes}
		fitView
		fitViewOptions={{ nodes: [{ id: nodes.find((node) => !node.data.hasParent)?.id }] }}
	>
		<Background />
		<Controls />
	</SvelteFlow>
</div>
