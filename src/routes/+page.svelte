<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Loader2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	const { form } = $props();

	let isLoading = $state(false);
</script>

<main class="container mx-auto max-w-2xl space-y-8 p-4 sm:p-8">
	<div class="space-y-2 text-center">
		<h1 class="text-3xl font-bold tracking-tight">Toki Pona Explainer</h1>
		<p class="text-muted-foreground">
			Enter a Toki Pona phrase to see its grammatical and semantic breakdown.
		</p>
	</div>

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
		<Button type="submit" disabled={isLoading}>
			{#if isLoading}
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
			{/if}
			Explain
		</Button>
	</form>

	{#if isLoading}
		<div class="flex items-center justify-center pt-10">
			<Loader2 class="h-8 w-8 animate-spin text-primary" />
			<p class="ml-4 text-muted-foreground">pona la o awen...</p>
		</div>
	{/if}

	{#if form?.error}
		<Card.Root class="border-destructive">
			<Card.Header>
				<Card.Title class="text-destructive">An Error Occurred</Card.Title>
			</Card.Header>
			<Card.Content>
				<p>{form.error}</p>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if form?.explanation}
		<div class="space-y-6">
			<!-- Step 1: Grouping -->
			<Card.Root>
				<Card.Header>
					<Card.Title>1. Grammatical Grouping</Card.Title>
					<Card.Description>How the phrase is structured with particles.</Card.Description>
				</Card.Header>
				<Card.Content>
					<p class="rounded-md bg-muted p-4 font-mono text-lg">{form.explanation.grouping}</p>
				</Card.Content>
			</Card.Root>

			<!-- Step 2: Breakdown -->
			<Card.Root>
				<Card.Header>
					<Card.Title>2. Bottom-Up Explanation</Card.Title>
					<Card.Description>Explaining each component, from the inside out.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#each form.explanation.breakdown as item}
						<div class="rounded-lg border p-4">
							<h4 class="text-lg font-bold">{item.term}</h4>
							<dl class="mt-2 space-y-1 text-sm">
								<div>
									<dt class="font-semibold text-muted-foreground">Literal Meaning</dt>
									<dd class="ml-4">{item.literal}</dd>
								</div>
								<div>
									<dt class="font-semibold text-muted-foreground">Conceptual Meaning</dt>
									<dd class="ml-4">{item.conceptual}</dd>
								</div>
							</dl>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<!-- Step 3: Final Translation -->
			<Card.Root>
				<Card.Header>
					<Card.Title>3. Final Translation</Card.Title>
					<Card.Description>A natural English translation combining all concepts.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="text-base whitespace-pre-wrap">
						{form.explanation.translation}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</main>
