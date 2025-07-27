function parseDictionary(content: string): Map<string, string> {
	const map = new Map<string, string>();
	const lines = content.split('\n');

	for (const line of lines) {
		if (line.startsWith('#') || line.trim() === '') {
			continue;
		}

		const parts = line.split(':');
		if (parts.length < 2) {
			continue;
		}

		const term = parts[0].trim();

		const definitions = parts.slice(1).join(':').replace(/\[|\]/g, '').replace(/\s\d+/g, '').trim();

		map.set(term, definitions);
	}
	return map;
}

export function generateDictionaryForPhrase(phrase: string, dictionaryContent: string): string {
	const dictionary = parseDictionary(dictionaryContent);
	const words = phrase.toLowerCase().trim().split(/\s+/);
	const foundTerms = new Map<string, string>();

	for (let i = 0; i < words.length; i++) {
		const single = words[i];
		if (dictionary.has(single)) {
			foundTerms.set(single, dictionary.get(single)!);
		}

		if (i < words.length - 1) {
			const twoWord = `${words[i]} ${words[i + 1]}`;
			if (dictionary.has(twoWord)) {
				foundTerms.set(twoWord, dictionary.get(twoWord)!);
			}
		}

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

	const sortedTerms = Array.from(foundTerms.keys()).sort((a, b) => a.length - b.length);

	const result = sortedTerms.map((term) => `- ${term}: ${foundTerms.get(term)}`);

	return result.join('\n');
}
