<script lang="ts">
	import { SvelteFlow, Background, Controls, type Node, type Edge } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import type { BreakdownItem } from '$lib/types';
	import CustomNode from './CustomNode.svelte';
	import dagre from 'dagre';

	let { root }: { root: BreakdownItem | null } = $props();

	const nodeTypes = {
		custom: CustomNode
	};

	const layouted = $derived.by(() => {
		if (!root) {
			return { nodes: [], edges: [] };
		}

		const dagreGraph = new dagre.graphlib.Graph();
		dagreGraph.setDefaultEdgeLabel(() => ({}));
		dagreGraph.setGraph({ rankdir: 'TB', nodesep: 25, ranksep: 50 });

		const calculatedNodes: Node[] = [];
		const calculatedEdges: Edge[] = [];

		function getDisplayTerm(node: BreakdownItem): string {
			return node.grouping ?? node.term;
		}

		function processNode(node: BreakdownItem, parentId?: string) {
			const id = node.term;
			calculatedNodes.push({
				id,
				type: 'custom',
				data: {
					term: getDisplayTerm(node),
					literal: node.literal,
					conceptual: node.conceptual,
					hasParent: !!parentId,
					hasChildren: !!node.children?.length
				},
				position: { x: 0, y: 0 }
			});

			if (parentId) {
				calculatedEdges.push({
					id: `${parentId}->${id}`,
					source: parentId,
					target: id
				});
			}

			if (node.children) {
				node.children.forEach((child) => processNode(child, id));
			}
		}

		processNode(root);

		const nodeWidth = 200;
		const nodeHeight = 150;

		calculatedNodes.forEach((node) => {
			dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
		});

		calculatedEdges.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		dagre.layout(dagreGraph);

		const finalNodes = calculatedNodes.map((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			return {
				...node,
				position: {
					x: nodeWithPosition.x - nodeWidth / 2,
					y: nodeWithPosition.y - nodeHeight / 2
				}
			};
		});

		return { nodes: finalNodes, edges: calculatedEdges };
	});

	let nodes = $state.raw(layouted.nodes);
	let edges = $state.raw(layouted.edges);

	$effect(() => {
		nodes = layouted.nodes;
		edges = layouted.edges;
	});

	const rootNodeId = $derived(nodes.find((node) => !node.data.hasParent)?.id);
</script>

<div class="w-full self-stretch">
	<SvelteFlow
		bind:nodes
		bind:edges
		{nodeTypes}
		fitView
		fitViewOptions={{ nodes: rootNodeId ? [{ id: rootNodeId }] : undefined }}
		nodesDraggable={false}
	>
		<Background />
		<Controls />
	</SvelteFlow>
</div>
