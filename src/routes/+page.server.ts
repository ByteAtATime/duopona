import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { OPENROUTER_API_KEY } from '$env/static/private';
import { generateDictionaryForPhrase } from '$lib/dictionary';
import dictionaryContent from '$lib/compounds.txt?raw';

const SYSTEM_PROMPT = `
<instructions>
You are an expert Toki Pona instructor. Your task is to analyze a sentence and break it down into its grammatical components. You must respond ONLY with a valid JSON object that adheres to the provided schema and rules.
</instructions>

<json_schema>
{
  "grouping": "The full sentence with parentheses showing the final, top-level grammatical groups.",
  "breakdown": [
    {
      "term": "The Toki Pona phrase for this node. MUST NOT include particles like 'li', 'e', 'pi', 'la'.",
      "grouping": "The parenthesized structure of this specific node's phrase. Parentheses are ONLY for multi-word phrases.",
      "literal": "A word-for-word translation (optional, if it aids understanding).",
      "conceptual": "The natural English meaning of this specific phrase.",
      "children": [ /* Recursive breakdown for sub-phrases */ ]
    }
  ],
  "translation": "A natural English translation of the entire sentence."
}
</json_schema>

<rules>
1.  **Particle Handling:** Structural particles ('li', 'e', 'pi', 'la', 'o') are SEPARATORS, not content.
    -   They MUST NOT appear in a node's 'term' field.
    -   They are used to join 'grouping' strings at a higher level.
    -   The 'breakdown' array should only contain nodes for the content phrases *around* the particles.

2.  **'grouping' String Rules (VERY IMPORTANT):**
    -   **Single-Word Node:** If a node represents a single word (a leaf node), its 'grouping' is just the word itself, with NO parentheses. E.g., { "term": "moku", "grouping": "moku", ... }
    -   **Multi-Word Node:** If a node represents a phrase of multiple words, its 'grouping' is constructed by joining its children's 'grouping' strings and then wrapping the ENTIRE result in ONE pair of parentheses. E.g., for "jan pona", the children are "jan" and "pona". Their groupings are "jan" and "pona". The parent's grouping is "(jan pona)".

3.  **Top-Level 'grouping' Construction:**
    -   The 'grouping' string at the root of the JSON object is special. It is formed by joining the 'grouping' strings of the top-level 'breakdown' items with the appropriate particle.
    -   Example: For "jan pona li moku", the top-level breakdown has two items (for "jan pona" and "moku"). Their groupings are "(jan pona)" and "moku". The root grouping is "(jan pona) li moku".

4.  **Breakdown Hierarchy:**
    -   A sentence is broken down by its main separators. 'la' and 'li' create the top-level split.
    -   A phrase is then recursively broken down. A predicate like "moku e telo" becomes a parent node with 'term': "moku e telo" and children for "moku" and "telo". Its 'grouping' is "(moku e telo)".
</rules>

<examples>
<example>
  <input>jan pona mi li moku</input>
  <output>
    {
      "grouping": "((jan pona) mi) li moku",
      "breakdown": [
        {
          "term": "jan pona mi",
          "grouping": "((jan pona) mi)",
          "conceptual": "my friend",
          "children": [
            {
              "term": "jan pona",
              "grouping": "(jan pona)",
              "literal": "good person",
              "conceptual": "friend",
              "children": [
                { "term": "jan", "grouping": "jan", "conceptual": "person", "children": [] },
                { "term": "pona", "grouping": "pona", "conceptual": "good", "children": [] }
              ]
            },
            { "term": "mi", "grouping": "mi", "conceptual": "me, my", "children": [] }
          ]
        },
        { "term": "moku", "grouping": "moku", "conceptual": "eats, food", "children": [] }
      ],
      "translation": "My friend is eating."
    }
  </output>
</example>
<example>
  <input>tomo pi telo suli</input>
  <output>
    {
      "grouping": "(tomo pi (telo suli))",
      "breakdown": [
        { "term": "tomo", "grouping": "tomo", "conceptual": "house, structure", "children": [] },
        {
          "term": "telo suli",
          "grouping": "(telo suli)",
          "literal": "water big",
          "conceptual": "ocean, large body of water",
          "children": [
            { "term": "telo", "grouping": "telo", "conceptual": "water, liquid", "children": [] },
            { "term": "suli", "grouping": "suli", "conceptual": "big, important", "children": [] }
          ]
        }
      ],
      "translation": "A lighthouse / a building by the ocean."
    }
  </output>
</example>
</examples>

<dictionary_context>
{dictionary}
</dictionary_context>
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
					'HTTP-Referer': `https://github.com/your-repo/your-project`, // Faking referer for OpenRouter
					'X-Title': 'Toki Pona Explainer'
				},
				body: JSON.stringify({
					model: 'deepseek/deepseek-chat-v3-0324:free',
					response_format: { type: 'json_object' },
					messages: [
						{ role: 'system', content: finalSystemPrompt },
						{ role: 'user', content: phrase }
					]
				})
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error('OpenRouter API Error:', errorData);
				return fail(response.status, {
					error: 'The AI service failed to respond. Please try again later.',
					phrase
				});
			}

			const data = await response.json();
			const content = data.choices[0].message.content;

			const explanation = JSON.parse(content);

			return { explanation, phrase };
		} catch (error) {
			console.error('Server Error:', error);
			return fail(500, {
				error: 'An internal server error occurred. Please check the logs.',
				phrase
			});
		}
	}
} satisfies Actions;
