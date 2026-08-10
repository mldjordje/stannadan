import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PropertyProfile, UserRole } from '@/lib/stay/types';
import { CinematicHeader } from './CinematicHeader';

const { pathnameState } = vi.hoisted(() => ({
	pathnameState: { current: '/' }
}));

vi.mock('next/navigation', () => ({
	usePathname: () => pathnameState.current
}));

const property: PropertyProfile = {
	name: 'Stan na Dan',
	tagline: 'Mir u centru grada',
	city: 'Niš',
	country: 'Srbija',
	address: 'Centar, Niš',
	phone: '+381 60 000 000',
	email: 'stay@example.com',
	googleMapsUrl: 'https://maps.example.com',
	heroImage: '/hero.jpg',
	description: 'Privatan gradski boravak.',
	highlights: [],
	neighborhood: []
};

function renderHeader({ userName, roles }: { userName?: string | null; roles?: UserRole[] } = {}) {
	return render(
		<CinematicHeader
			property={property}
			userName={userName}
			roles={roles}
		/>
	);
}

async function openMenu() {
	const user = userEvent.setup();
	const trigger = screen.getByRole('button', { name: 'Otvori meni' });

	await user.click(trigger);

	return {
		user,
		trigger,
		dialog: screen.getByRole('dialog', { name: 'Glavni meni' })
	};
}

describe('CinematicHeader', () => {
	beforeEach(() => {
		pathnameState.current = '/';
		document.body.style.overflow = '';
	});

	it('links the current logo home and exposes a stable booking entry', () => {
		renderHeader();

		expect(screen.getByRole('link', { name: 'Stan na Dan, početna' })).toHaveAttribute('href', '/');
		expect(screen.getAllByRole('link', { name: 'Rezerviši' })[0]).toHaveAttribute('href', '/availability');
		expect(document.querySelector('[data-booking-entry="mobile-bar"]')).toBeInTheDocument();
	});

	it('opens and closes the dialog with its buttons and Escape', async () => {
		renderHeader();
		const { user, trigger, dialog } = await openMenu();

		expect(trigger).toHaveAttribute('aria-expanded', 'true');
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(dialog).toHaveAttribute('data-open', 'true');

		await user.click(within(dialog).getByRole('button', { name: 'Zatvori meni' }));
		expect(trigger).toHaveAttribute('aria-expanded', 'false');

		await user.click(trigger);
		fireEvent.keyDown(document, { key: 'Escape' });
		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('marks apartment details as part of the apartments destination', async () => {
		pathnameState.current = '/apartments/loft';
		renderHeader();

		const desktopNav = screen.getByRole('navigation', {
			name: 'Glavna navigacija'
		});

		expect(within(desktopNav).getByRole('link', { name: 'Apartmani' })).toHaveAttribute('aria-current', 'page');
		expect(within(desktopNav).getByRole('link', { name: 'Početna' })).not.toHaveAttribute('aria-current');
	});

	it.each([
		{
			userName: undefined,
			roles: [] as UserRole[],
			label: 'Prijava',
			href: '/sign-in'
		},
		{
			userName: 'Mila',
			roles: ['customer'] as UserRole[],
			label: 'Moj nalog',
			href: '/account'
		},
		{
			userName: 'Ana',
			roles: ['admin'] as UserRole[],
			label: 'Admin',
			href: '/admin'
		}
	])('uses the $label account destination', async ({ userName, roles, label, href }) => {
		renderHeader({ userName, roles });
		const { dialog } = await openMenu();
		const accountLink = within(dialog).getByRole('link', {
			name: new RegExp(`^${label}`)
		});

		expect(accountLink).toHaveAttribute('href', href);
	});

	it('restores the previous body overflow and returns focus to the trigger', async () => {
		document.body.style.overflow = 'clip';
		renderHeader();
		const { user, trigger, dialog } = await openMenu();

		expect(document.body.style.overflow).toBe('hidden');
		await user.click(within(dialog).getByRole('button', { name: 'Zatvori meni' }));

		expect(document.body.style.overflow).toBe('clip');
		expect(trigger).toHaveFocus();
	});

	it('closes when the pathname changes', async () => {
		const view = renderHeader();
		const { trigger } = await openMenu();

		pathnameState.current = '/contact';
		view.rerender(<CinematicHeader property={property} />);

		expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	it('reveals the home mobile booking entry only after arrival completes', () => {
		renderHeader();
		const mobileBar = document.querySelector('[data-visible]');

		expect(mobileBar).toHaveAttribute('data-visible', 'false');

		act(() => window.dispatchEvent(new Event('site:arrival-complete')));

		expect(mobileBar).toHaveAttribute('data-visible', 'true');
	});

	it('shows the mobile booking entry immediately away from home', () => {
		pathnameState.current = '/contact';
		renderHeader();

		expect(document.querySelector('[data-visible]')).toHaveAttribute('data-visible', 'true');
	});
});
