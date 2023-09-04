import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		session: {
			...locals.session.$publicData,
			antiCsrfToken: locals.session.$antiCSRFToken()
		}
	};
};
