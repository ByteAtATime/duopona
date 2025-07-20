/**
 * Parses the raw text content of compounds.txt into a Map.
 * @param content The raw string content of the dictionary file.
 * @returns A Map where keys are Toki Pona terms and values are their definitions.
 */
function parseDictionary(content: string): Map<string, string> {
	const map = new Map<string, string>();
	const lines = content.split('\n');

	for (const line of lines) {
		// Skip comments and empty lines
		if (line.startsWith('#') || line.trim() === '') {
			continue;
		}

		const parts = line.split(':');
		if (parts.length < 2) {
			continue;
		}

		const term = parts[0].trim();
		// Clean up the definitions: remove brackets, numbers with preceding spaces, and trim.
		const definitions = parts
			.slice(1)
			.join(':') // Re-join in case there are colons in definitions
			.replace(/\[|\]/g, '') // Remove brackets
			.replace(/\s\d+/g, '') // Remove numbers (e.g., "94")
			.trim();

		map.set(term, definitions);
	}
	return map;
}

/**
 * Generates a formatted dictionary string for all words and compounds found in a given phrase.
 * @param phrase The input Toki Pona sentence.
 * @param dictionaryContent The raw string content of the `compounds.txt` dictionary.
 * @returns A formatted string with definitions for relevant terms.
 */
export function generateDictionaryForPhrase(phrase: string, dictionaryContent: string): string {
	const dictionary = parseDictionary(dictionaryContent);
	const words = phrase.toLowerCase().trim().split(/\s+/);
	const foundTerms = new Map<string, string>();

	// Check for single words, two-word, and three-word compounds
	for (let i = 0; i < words.length; i++) {
		// Single word
		const single = words[i];
		if (dictionary.has(single)) {
			foundTerms.set(single, dictionary.get(single)!);
		}

		// Two-word compound
		if (i < words.length - 1) {
			const twoWord = `${words[i]} ${words[i + 1]}`;
			if (dictionary.has(twoWord)) {
				foundTerms.set(twoWord, dictionary.get(twoWord)!);
			}
		}

		// Three-word compound
		if (i < words.length - 2) {
			const threeWord = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
			if (dictionary.has(threeWord)) {
				foundTerms.set(threeWord, dictionary.get(threeWord)!);
			}
		}
	}

	if (foundTerms.size === 0) {
		return 'No definitions found for the words in this phrase.';
	}

	// Format the output string, sorting by term length for readability
	const sortedTerms = Array.from(foundTerms.keys()).sort((a, b) => a.length - b.length);

	const result = sortedTerms.map((term) => `- ${term}: ${foundTerms.get(term)}`);

	return result.join('\n');
}
