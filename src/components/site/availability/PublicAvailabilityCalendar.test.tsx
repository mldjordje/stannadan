import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PublicAvailabilityCalendar from './PublicAvailabilityCalendar';
import { buildCalendarCells, dateIsUnavailable } from './calendar';

const apartments = [
	{ id: 'one', name: 'Apartman Jedan' },
	{ id: 'two', name: 'Apartman Dva' }
];

const ranges = [
	{
		id: 'range-one',
		apartmentId: 'one',
		start: '2026-08-10',
		end: '2026-08-13'
	},
	{
		id: 'range-two',
		apartmentId: 'two',
		start: '2026-08-20',
		end: '2026-08-22'
	}
];

describe('PublicAvailabilityCalendar', () => {
	it('builds a Monday-first six-week grid and treats checkout as available', () => {
		const cells = buildCalendarCells(new Date(2026, 7, 1));
		expect(cells).toHaveLength(42);
		expect(cells[0].iso).toBe('2026-07-27');
		expect(dateIsUnavailable('2026-08-12', ranges)).toBe(true);
		expect(dateIsUnavailable('2026-08-13', ranges)).toBe(false);
	});

	it('switches apartments and exposes only neutral availability labels', () => {
		render(
			<PublicAvailabilityCalendar
				apartments={apartments}
				unavailableRanges={ranges}
			/>
		);
		const selector = screen.getByLabelText('Apartman');
		expect(selector).toHaveValue('one');
		fireEvent.change(selector, { target: { value: 'two' } });
		expect(selector).toHaveValue('two');
		expect(screen.getByRole('button', { name: 'Prethodni mesec' })).toBeVisible();
		expect(screen.getByRole('button', { name: 'Sledeći mesec' })).toBeVisible();
		expect(document.body.textContent).not.toMatch(/email|telefon|gost|napomena/i);
	});
});
