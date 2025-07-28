import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import type { Translation } from '$lib/translations';

export const prerender = true;

const stories = import.meta.glob('$lib/stories/*.yml', { eager: true });

export const entries: EntryGenerator = () => {
	return Object.keys(stories)
		.map((s) => ({ id: s.split('/').at(-1)?.replace('.yml', '') }))
		.filter((x) => x.id) as { id: string }[];
};

export const load: PageServerLoad = async ({ params }) => {
	console.log(Object.keys(stories).map((s) => ({ id: s.split('/').at(-1)?.replace('.yml', '') })));
	const story = stories[`/src/lib/stories/${params.id}.yml`]?.default as Translation | undefined;

	if (!story) return error(404, 'Story not found');

	return { story };
};
