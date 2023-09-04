import type { SessionContextClass } from '@blitzjs/auth';
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: SessionContextClass;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};

import { SimpleRolesIsAuthorized } from '@blitzjs/auth';
import { User } from './src/lib/db';

export type Role = 'ADMIN' | 'USER';

declare module '@blitzjs/auth' {
	export interface Session {
		isAuthorized: SimpleRolesIsAuthorized<Role>;
		PublicData: {
			userId: User['id'];
			role: Role;
			views?: number;
		};
	}
}
