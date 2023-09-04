import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	await locals.session.$authorize();
	return {
		session: locals.session.$publicData
	};
};
