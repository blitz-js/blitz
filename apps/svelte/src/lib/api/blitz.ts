import { SessionContextClass, getSession } from '@blitzjs/auth';
import type { RequestHandler } from '@sveltejs/kit';
import { parse } from 'cookie';

export const api = (handler: RequestHandler): RequestHandler => {
	return async (event) => {
		const response = {
			type: 'ok',
			res: {} as Response
		};
		try {
			const result = await handler(event);
			response.res = result;
		} catch (e) {
			response.type = 'error';
			response.res = e as Response;
		} finally {
			const { headers, sessionContext } = await getSession({
				req: event.request
			});
			//@ts-expect-error works in ts 5.3
			const setCookies = headers.getSetCookie();
			for (const value of setCookies) {
				const c = parse(value);
				const [[cookieKey, cookieValue], ...options] = Object.entries(c);
				const cookieOptions = options.reduce((acc, [key, value]) => {
					acc[key.toLowerCase()] = value;
					return acc;
				}, {} as Record<string, string>);
				const isAntiCSRF = cookieKey.includes('_sAntiCsrfToken');
				event.cookies.set(cookieKey, cookieValue, {
					...cookieOptions,
					expires: new Date(cookieOptions.expires),
					httpOnly: isAntiCSRF ? false : true,
					sameSite: globalThis.sessionConfig.sameSite,
					secure: globalThis.sessionConfig.secureCookies
				});
			}
			headers.delete('set-cookie');
			event.setHeaders(Object.fromEntries(headers.entries()));
			event.locals.session = sessionContext as SessionContextClass;
		}
		if (response.type === 'error') {
			throw response.res;
		}
		return response.res;
	};
};
