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
