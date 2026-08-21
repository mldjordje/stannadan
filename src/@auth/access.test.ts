import { describe, expect, it } from 'vitest';
import type { StayUser } from '@/lib/stay/types';
import { ADMIN_EMAILS, resolveAccessFromUsers, resolveDefaultRoles } from './access';

function makeUser(overrides: Partial<StayUser>): StayUser {
	return {
		id: 'user-1',
		email: 'owner@example.com',
		displayName: 'Owner',
		role: 'owner',
		apartmentIds: ['apt-1'],
		status: 'active',
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides
	};
}

describe('Google account role mapping', () => {
	it('grants admin access to the bootstrap owner accounts', () => {
		expect([...ADMIN_EMAILS]).toEqual([
			'dragana.mlad018@gmail.com',
			'web.wise018@gmail.com',
			'mzarko018@gmail.com'
		]);
		expect(resolveDefaultRoles('DRAGANA.MLAD018@gmail.com')).toEqual(['admin']);
		expect(resolveDefaultRoles('web.wise018@gmail.com')).toEqual(['admin']);
	});

	it('keeps every other Google account out of the admin role', () => {
		expect(resolveDefaultRoles('guest@gmail.com')).toEqual(['customer']);
		expect(resolveDefaultRoles(null)).toEqual(['customer']);
	});
});

describe('resolveAccessFromUsers', () => {
	it('always gives the bootstrap accounts unrestricted admin access', () => {
		const access = resolveAccessFromUsers('web.wise018@gmail.com', []);

		expect(access.roles).toEqual(['admin']);
		expect(access.isSuperAdmin).toBe(true);
		expect(access.apartmentIds).toBeNull();
	});

	it('scopes an owner to the apartments assigned to them', () => {
		const access = resolveAccessFromUsers('Owner@Example.com', [makeUser({ apartmentIds: ['apt-1', 'apt-2'] })]);

		expect(access.roles).toEqual(['owner']);
		expect(access.isSuperAdmin).toBe(false);
		expect(access.apartmentIds).toEqual(['apt-1', 'apt-2']);
	});

	it('gives an invited admin access to every apartment', () => {
		const access = resolveAccessFromUsers('owner@example.com', [makeUser({ role: 'admin', apartmentIds: [] })]);

		expect(access.roles).toEqual(['admin']);
		expect(access.apartmentIds).toBeNull();
	});

	it('treats disabled and unknown accounts as customers', () => {
		expect(resolveAccessFromUsers('owner@example.com', [makeUser({ status: 'disabled' })]).roles).toEqual([
			'customer'
		]);
		expect(resolveAccessFromUsers('nobody@example.com', [makeUser({})]).roles).toEqual(['customer']);
	});
});
