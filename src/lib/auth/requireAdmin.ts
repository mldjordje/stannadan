import { NextResponse } from 'next/server';
import { auth } from '@auth/authJs';
import { isSuperAdminEmail, normalizeEmail, resolveStayAccess } from '@auth/access';
import type { StayData, StayUserRole } from '@/lib/stay/types';

export type AdminContext = {
	email: string;
	role: StayUserRole;
	isSuperAdmin: boolean;
	/** `null` means every apartment. */
	apartmentIds: string[] | null;
	displayName: string;
};

function rolesOf(role: unknown) {
	return Array.isArray(role) ? role : role ? [role as string] : [];
}

/**
 * Resolves the panel context of the current session, or `null` when the visitor may not
 * open the admin panel at all.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
	const session = await auth();
	const email = normalizeEmail(session?.user?.email);

	if (!email) {
		return null;
	}

	const access = await resolveStayAccess(email);

	if (access.roles.includes('admin')) {
		return {
			email,
			role: 'admin',
			isSuperAdmin: isSuperAdminEmail(email),
			apartmentIds: null,
			displayName: access.user?.displayName || session?.user?.name || email
		};
	}

	if (access.roles.includes('owner')) {
		return {
			email,
			role: 'owner',
			isSuperAdmin: false,
			apartmentIds: access.apartmentIds ?? [],
			displayName: access.user?.displayName || session?.user?.name || email
		};
	}

	return null;
}

export function canManageApartment(context: AdminContext, apartmentId: string | null | undefined) {
	if (context.apartmentIds === null) {
		return true;
	}

	return Boolean(apartmentId) && context.apartmentIds.includes(apartmentId as string);
}

/**
 * Narrows a full data set down to what the given context is allowed to see.
 */
export function scopeStayData(data: StayData, context: AdminContext) {
	if (context.apartmentIds === null) {
		return data;
	}

	const allowed = new Set(context.apartmentIds);

	return {
		...data,
		apartments: data.apartments.filter((apartment) => allowed.has(apartment.id)),
		reservations: data.reservations.filter((reservation) => allowed.has(reservation.apartmentId)),
		calendarBlocks: data.calendarBlocks.filter((block) => allowed.has(block.apartmentId)),
		users: [],
		bookingSync: {
			...data.bookingSync,
			mappings: data.bookingSync.mappings.filter((mapping) => allowed.has(mapping.apartmentId))
		}
	} satisfies StayData;
}

/**
 * Guard for routes any panel user (admin or apartment owner) may call.
 * Returns a response on failure, otherwise the resolved context.
 */
export async function requirePanelUser(): Promise<{ context: AdminContext } | { response: NextResponse }> {
	const session = await auth();

	if (!session) {
		return { response: NextResponse.json({ error: 'Authentication is required.' }, { status: 401 }) };
	}

	const context = await getAdminContext();

	if (!context) {
		return { response: NextResponse.json({ error: 'Admin access is required.' }, { status: 403 }) };
	}

	return { context };
}

/**
 * Guard for routes restricted to full admins, e.g. user management.
 */
export async function requireFullAdmin(): Promise<{ context: AdminContext } | { response: NextResponse }> {
	const result = await requirePanelUser();

	if ('response' in result) {
		return result;
	}

	if (result.context.role !== 'admin') {
		return { response: NextResponse.json({ error: 'Admin access is required.' }, { status: 403 }) };
	}

	return result;
}

export async function requireAdmin() {
	const session = await auth();
	const roles = rolesOf(session?.db?.role);

	if (!roles.includes('admin')) {
		return NextResponse.json({ error: 'Admin access is required.' }, { status: session ? 403 : 401 });
	}

	return null;
}

/**
 * True for any panel user (admin or apartment owner), used to decide whether a request may
 * set privileged reservation fields such as source, status and total price.
 */
export async function isAdminSession() {
	return Boolean(await getAdminContext());
}
