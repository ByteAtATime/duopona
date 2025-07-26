import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Translation } from '$lib/translations';

export const prerender = true;

const stories = import.meta.glob('$lib/stories/*.yml', { eager: true });

export const load: PageServerLoad = async ({ params }) => {
	const story = stories[`/src/lib/stories/${params.id}.yml`]?.default as Translation | undefined;

	if (!story) return error(404, 'Story not found');

	return { story };
};
