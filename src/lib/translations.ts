import dictionary from '$lib/compounds.txt?raw';

export type Translation = { toki: string; literal: string; original: string };

export const matchLines = (translation: Translation): Translation[] => {
	const [tokiLines, literalLines, originalLines] = [
		translation.toki.split('\n'),
		translation.literal.split('\n'),
		translation.original.split('\n')
	];

	const maxLines = Math.max(tokiLines.length, literalLines.length, originalLines.length);

	return Array.from({ length: maxLines }, (_, i) => ({
		toki: tokiLines[i] ?? '',
		literal: literalLines[i] ?? '',
		original: originalLines[i] ?? ''
	}));
};

const getDictionaryDefinitions = (dictionary: string) =>
	new Map(
		dictionary
			.matchAll(/([\w ]+):\s*\[(.+)\]/g)
			.map((match) => [match[1], match[2]])
			.map(([term, rawTranslations]) => [
				term,
				rawTranslations
					.split(',')
					.map((translation) => translation.trim().match(/(.+)\s+\d+/)?.[1])
					.filter((x) => x) as string[]
			])
	);

type Token = {
	phrase: string;
	definition: string[] | undefined;
};

export const tokenizeTokiPona = (sentence: string): Token[] => {
	const validChars = new Set('aeijklmnopstuw '); // space is intentional
	const cleanedString = sentence
		.split('')
		.map((c) => c.toLowerCase())
		.filter((c) => validChars.has(c))
		.join('')
		.trim();

	const words = cleanedString.split(' ').filter((w) => w.length > 0);

	const definitions = getDictionaryDefinitions(dictionary);
	const maxSubsetLength = Math.max(...definitions.keys().map((key) => key.split(' ').length));

	const tokens: Token[] = [];

	for (let i = 0; i < words.length; ) {
		let found = false;
		for (
			let wordsToConsume = Math.min(maxSubsetLength, words.length - i);
			wordsToConsume >= 1;
			wordsToConsume--
		) {
			const phrase = words.slice(i, i + wordsToConsume).join(' ');
			if (definitions.has(phrase)) {
				tokens.push({ phrase, definition: definitions.get(phrase) });
				i += wordsToConsume;
				found = true;
				break;
			}
		}
		if (!found) {
			tokens.push({ phrase: words[i], definition: undefined });
			i++;
		}
	}

	return tokens;
};
