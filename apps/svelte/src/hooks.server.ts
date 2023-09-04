import {
	getSession,
	type AuthPluginOptions,
	simpleRolesIsAuthorized,
	PrismaStorage,
	SessionContextClass
} from '@blitzjs/auth';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import db from '$lib/db';
import { parse } from 'cookie';

export const handle = sequence(
	BlitzAuth({
		cookiePrefix: 'web-cookie-prefix',
		storage: PrismaStorage(db),
		isAuthorized: simpleRolesIsAuthorized
	})
);

interface SessionConfigOptions {
	cookiePrefix?: string;
	sessionExpiryMinutes?: number;
	anonSessionExpiryMinutes?: number;
	method?: 'essential' | 'advanced';
	sameSite?: 'none' | 'lax' | 'strict';
	secureCookies?: boolean;
	domain?: string;
	publicDataKeysToSyncAcrossSessions?: string[];
}

const defaultConfig_: SessionConfigOptions = {
	sessionExpiryMinutes: 30 * 24 * 60, // Sessions expire after 30 days of being idle
	anonSessionExpiryMinutes: 5 * 365 * 24 * 60, // Sessions expire after 5 years of being idle
	method: 'essential',
	sameSite: 'lax',
	publicDataKeysToSyncAcrossSessions: ['role', 'roles'],
	secureCookies: !process.env.DISABLE_SECURE_COOKIES && process.env.NODE_ENV === 'production'
};

export function BlitzAuth(options: AuthPluginOptions): Handle {
	return async function ({ event, resolve }) {
		globalThis.__BLITZ_SESSION_COOKIE_PREFIX = options.cookiePrefix || 'blitz';
		globalThis.sessionConfig = {
			...defaultConfig_,
			...options.storage,
			...options
		};
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

		event.locals.session = sessionContext as SessionContextClass;
		console.log(sessionContext.$publicData);

		return resolve(event);
	};
}

export const handleError: HandleServerError = async ({ error }) => {
	if (error instanceof Error) {
		if (error.name === 'AuthenticationError') {
			return {
				message: 'Error: You are not authenticated'
			};
		} else if (error.name === 'AuthorizationError') {
			return {
				message: 'Sorry, you are not authorized to access this'
			};
		}
	}

	return {
		message: (error as Error).message
	};
};

export async function handleFetch({ event, request, fetch }) {
	const session = event.locals.session;
	console.log(request.url);
	return await fetch(request, {
		headers: {
			...request.headers,
			'anti-csrf': session.$antiCSRFToken()
		}
	});
}
