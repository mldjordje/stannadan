import { describe, expect, it } from 'vitest';
import { ADMIN_EMAILS, resolveDefaultRoles } from './access';

describe('Google account role mapping', () => {
	it('grants admin access only to the two owner accounts', () => {
		expect([...ADMIN_EMAILS]).toEqual(['dragana.mlad018@gmail.com', 'web.wise018@gmail.com']);
		expect(resolveDefaultRoles('DRAGANA.MLAD018@gmail.com')).toEqual(['admin']);
		expect(resolveDefaultRoles('web.wise018@gmail.com')).toEqual(['admin']);
	});

	it('keeps every other Google account out of the admin role', () => {
		expect(resolveDefaultRoles('guest@gmail.com')).toEqual(['customer']);
		expect(resolveDefaultRoles(null)).toEqual(['customer']);
	});
});
