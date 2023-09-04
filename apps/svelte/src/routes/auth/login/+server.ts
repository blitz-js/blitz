import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { api } from '$lib/api/blitz';

export const POST: RequestHandler = api(async ({ locals }) => {
	await locals.session.$create({
		userId: 1,
		role: 'ADMIN'
	});
	throw redirect(302, '/');
});
