import type { UserRole } from '@/lib/stay/types';

export const ADMIN_EMAILS = new Set(['dragana.mlad018@gmail.com', 'web.wise018@gmail.com']);

export function resolveDefaultRoles(email?: string | null): UserRole[] {
	const normalizedEmail = email?.trim().toLowerCase() ?? '';

	return ADMIN_EMAILS.has(normalizedEmail) ? ['admin'] : ['customer'];
}
