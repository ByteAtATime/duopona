import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';
import type { Explanation } from '$lib/types';
import { generateDictionaryForPhrase } from '$lib/dictionary';
import dictionaryContent from '$lib/compounds.txt?raw';

const SYSTEM_PROMPT = `
# Toki Pona Explainer

You are a Toki Pona instructor that analyzes sentence structure for learners. 

## Response Format

Respond with ONLY a valid JSON object (no code blocks or extra text):
{
  "grouping": "Sentence with parentheses showing grammatical groups",
  "breakdown": [
    {
      "term": "Toki Pona phrase/word",
      "literal": "Word-for-word translation (if different from conceptual)",
      "conceptual": "Natural English meaning",
      "children": []
    }
  ],
  "translation": "Natural English translation"
}

## Structure Rules

- \`breakdown\` is a grammatical tree with major phrase units as top-level nodes
- Particles (li, e, pi, o, la) show structure via grouping/nesting, NOT as separate nodes
- \`grouping\` uses nested parentheses: \`((tomo tawa) mi) li (suli)\`
- Leaf nodes should always be a single word

## Translation Guidelines

**Prioritize natural English over literal translations:**
- \`jan pona\` → "friend" (not "good person")  
- \`tomo tawa\` → "car" (not "moving house")
- Use context and common usage patterns
- Choose what English speakers would naturally say

## Grammar Integration

- **li**: Creates subject-predicate split (two main nodes)
- **e**: Object becomes child of predicate  
- **pi**: Creates nested possessive/descriptive grouping
- **o/la**: Affects sentence type/framing, not node structure

## Dictionary Reference

{dictionary}

Analyze the input phrase using this dictionary as a baseline, but prioritize compound meanings and natural translations.
`;

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const phrase = formData.get('phrase')?.toString();

		if (!phrase) {
			return fail(400, { error: 'Please enter a phrase.', phrase: '' });
		}

		const dictionaryForPhrase = generateDictionaryForPhrase(phrase, dictionaryContent);

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
					model: 'deepseek/deepseek-chat-v3-0324:free',
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
