<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Loader2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import BreakdownTree from '$lib/components/BreakdownTree.svelte';
	import type { BreakdownItem } from '$lib/types';

	const { form } = $props();

	let isLoading = $state(false);

	let fullPhraseNode: BreakdownItem | null = $derived.by(() => {
		if (!form?.explanation || !form?.phrase) return null;
		return {
			term: form.phrase,
			conceptual: form.explanation.translation.split('\n')[0],
			children: form.explanation.breakdown
		};
	});
</script>

<div class="flex h-screen flex-col bg-background text-foreground">
	<header class="flex-shrink-0 border-b bg-card p-4 shadow-sm">
		<div class="container mx-auto flex max-w-4xl items-center gap-x-6">
			<h1 class="text-xl font-bold tracking-tight">Toki Pona Explainer</h1>
			<form
				method="POST"
				class="flex w-full items-center space-x-2"
				use:enhance={() => {
					isLoading = true;

					return ({ update }) => {
						isLoading = false;
						update();
					};
				}}
			>
				<Input
					name="phrase"
					type="text"
					value={form?.phrase ?? 'nasin pi lawa ma li ken ike'}
					placeholder="o toki e ijo..."
					disabled={isLoading}
				/>
				<Button type="submit" disabled={isLoading} class="w-32">
					{#if isLoading}
						<Loader2 class="h-4 w-4 animate-spin" />
					{:else}
						Explain
					{/if}
				</Button>
			</form>
		</div>
	</header>

	<main class="flex-grow overflow-auto p-8">
		<div class="flex min-h-full min-w-max items-center justify-center">
			{#if isLoading}
				<div class="flex items-center text-muted-foreground">
					<Loader2 class="mr-2 h-6 w-6 animate-spin" />
					<span>pona la o awen...</span>
				</div>
			{:else if form?.error}
				<div
					class="text-destructive-foreground rounded-lg border border-destructive bg-destructive/10 p-4 text-center"
				>
					<h3 class="font-bold">An Error Occurred</h3>
					<p>{form.error}</p>
				</div>
			{:else if fullPhraseNode}
				<BreakdownTree root={fullPhraseNode} />
			{:else}
				<div class="text-center text-muted-foreground">
					<p class="text-lg">Enter a phrase above to begin.</p>
					<p class="mt-1 text-sm">The explanation tree will appear here.</p>
				</div>
			{/if}
		</div>
	</main>
</div>
