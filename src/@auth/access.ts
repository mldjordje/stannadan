import type { StayUser, UserRole } from '@/lib/stay/types';

/**
 * Bootstrap owners of the installation. These accounts are always admins and can never be
 * demoted or deleted through the user management screen, so the panel can never lock itself out.
 */
export const ADMIN_EMAILS = new Set(['dragana.mlad018@gmail.com', 'web.wise018@gmail.com', 'mzarko018@gmail.com']);

export type StayAccess = {
	email: string;
	roles: UserRole[];
	isSuperAdmin: boolean;
	/** `null` means every apartment (admins). Owners get an explicit list. */
	apartmentIds: string[] | null;
	user: StayUser | null;
};

const guestAccess: StayAccess = {
	email: '',
	roles: ['customer'],
	isSuperAdmin: false,
	apartmentIds: [],
	user: null
};

export function normalizeEmail(email?: string | null) {
	return email?.trim().toLowerCase() ?? '';
}

export function isSuperAdminEmail(email?: string | null) {
	return ADMIN_EMAILS.has(normalizeEmail(email));
}

/**
 * Synchronous fallback used where the stay database is not reachable (unit tests, edge contexts).
 */
export function resolveDefaultRoles(email?: string | null): UserRole[] {
	return isSuperAdminEmail(email) ? ['admin'] : ['customer'];
}

export function resolveAccessFromUsers(email: string | null | undefined, users: StayUser[]): StayAccess {
	const normalizedEmail = normalizeEmail(email);

	if (!normalizedEmail) {
		return guestAccess;
	}

	if (isSuperAdminEmail(normalizedEmail)) {
		const record = users.find((user) => user.email === normalizedEmail) ?? null;

		return {
			email: normalizedEmail,
			roles: ['admin'],
			isSuperAdmin: true,
			apartmentIds: null,
			user: record
		};
	}

	const record = users.find((user) => user.email === normalizedEmail && user.status === 'active');

	if (!record) {
		return { ...guestAccess, email: normalizedEmail };
	}

	return {
		email: normalizedEmail,
		roles: [record.role],
		isSuperAdmin: false,
		apartmentIds: record.role === 'admin' ? null : record.apartmentIds,
		user: record
	};
}

const accessCacheTtlMs = 15_000;
let usersCache: { users: StayUser[]; expiresAt: number } | null = null;

export function invalidateAccessCache() {
	usersCache = null;
}

async function loadUsers(): Promise<StayUser[]> {
	if (usersCache && usersCache.expiresAt > Date.now()) {
		return usersCache.users;
	}

	// Imported lazily so this module stays free of server-only dependencies for consumers that
	// only need the pure role helpers.
	const { readStayData } = await import('@/lib/stay/store');
	const data = await readStayData();
	usersCache = { users: data.users, expiresAt: Date.now() + accessCacheTtlMs };

	return usersCache.users;
}

/**
 * Resolves the effective panel access for a signed-in account. Falls back to the hardcoded
 * bootstrap list if the stay database cannot be read, so the owners never lose access.
 */
export async function resolveStayAccess(email?: string | null): Promise<StayAccess> {
	try {
		return resolveAccessFromUsers(email, await loadUsers());
	} catch (error) {
		console.error('Stay users could not be read while resolving access.', error);

		return {
			email: normalizeEmail(email),
			roles: resolveDefaultRoles(email),
			isSuperAdmin: isSuperAdminEmail(email),
			apartmentIds: isSuperAdminEmail(email) ? null : [],
			user: null
		};
	}
}
