import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { api } from '$lib/api/blitz';

export const POST: RequestHandler = api(async ({ locals }) => {
	await locals.session.$revoke();
	throw redirect(302, '/');
});
