import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';
import type { Explanation } from '$lib/types';
import { generateDictionaryForPhrase } from '$lib/dictionary';
import dictionaryContent from '$lib/compounds.txt?raw';

const SYSTEM_PROMPT = `
You are a "Toki Pona Explainer" bot. Your purpose is to provide a clear, educational breakdown of Toki Pona sentences for learners.

When given a phrase, you MUST respond with a single, valid JSON object and nothing else (not even code fences). The JSON object must conform to this schema:
{
  "grouping": "The sentence rewritten with parentheses to show grammatical groups.",
  "breakdown": [
    {
      "term": "The Toki Pona component being explained (e.g., 'lawa ma').",
      "literal": "The literal, word-for-word meaning.",
      "conceptual": "The conceptual or common meaning."
    }
  ],
  "translation": "One or more complete, natural-sounding English translations, separated by newlines if necessary."
}

Analyze the user's phrase and populate the JSON object fields accordingly. Start by explaining the most deeply nested components in the 'breakdown' array.

To aid your analysis, a dictionary of relevant terms from the input sentence is provided below. Use it to inform your literal and conceptual meanings.
--- DICTIONARY ---
{dictionary}
--- END DICTIONARY ---
`;

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const phrase = formData.get('phrase')?.toString();

		if (!phrase) {
			return fail(400, { error: 'Please enter a phrase.', phrase: '' });
		}

		const dictionaryForPhrase = generateDictionaryForPhrase(phrase, dictionaryContent);
		console.log(dictionaryForPhrase);

		const finalSystemPrompt = SYSTEM_PROMPT.replace('{dictionary}', dictionaryForPhrase);

		try {
			const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENROUTER_API_KEY}`,
					'HTTP-Referer': `https://github.com/your-repo/your-project`,
					'X-Title': 'Toki Pona Explainer'
				},
				body: JSON.stringify({
					model: 'google/gemini-2.5-flash-lite-preview-06-17',
					response_format: { type: 'json_object' },
					messages: [
						{
							role: 'system',
							content: finalSystemPrompt
						},
						{
							role: 'user',
							content: phrase
						}
					]
				})
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('OpenRouter API Error:', errorData);
				return fail(response.status, {
					error: 'The AI service failed to respond.',
					phrase
				});
			}

			const data = await response.json();
			const content = data.choices[0].message.content;

			const explanation: Explanation = JSON.parse(content);

			return { explanation, phrase };
		} catch (error) {
			console.error('Server Error:', error);
			return fail(500, {
				error: 'An internal server error occurred while processing your request.',
				phrase
			});
		}
	}
} satisfies Actions;
