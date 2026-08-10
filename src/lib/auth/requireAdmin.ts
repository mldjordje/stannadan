import { NextResponse } from 'next/server';
import { auth } from '@auth/authJs';

export async function requireAdmin() {
	const session = await auth();
	const role = session?.db?.role;
	const roles = Array.isArray(role) ? role : role ? [role] : [];

	if (!roles.includes('admin')) {
		return NextResponse.json({ error: 'Admin access is required.' }, { status: session ? 403 : 401 });
	}

	return null;
}

export async function isAdminSession() {
	const session = await auth();
	const role = session?.db?.role;
	const roles = Array.isArray(role) ? role : role ? [role] : [];

	return roles.includes('admin');
}
