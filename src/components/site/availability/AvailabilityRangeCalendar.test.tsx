import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AvailabilityRangeCalendar from './AvailabilityRangeCalendar';

afterEach(() => vi.useRealTimers());

describe('AvailabilityRangeCalendar', () => {
	it('selects arrival and departure and exposes the range', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-11T12:00:00'));
		const onChange = vi.fn();
		render(
			<AvailabilityRangeCalendar
				ranges={[]}
				checkIn=""
				checkOut=""
				onChange={onChange}
			/>
		);
		fireEvent.click(screen.getByRole('gridcell', { name: '2026-08-12, slobodno' }));
		fireEvent.click(screen.getByRole('gridcell', { name: '2026-08-15, slobodno' }));
		expect(onChange).toHaveBeenNthCalledWith(1, {
			checkIn: '2026-08-12',
			checkOut: ''
		});
		expect(onChange).toHaveBeenNthCalledWith(2, {
			checkIn: '2026-08-12',
			checkOut: '2026-08-15'
		});
	});

	it('rejects a range that crosses an unavailable night', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-08-11T12:00:00'));
		const onChange = vi.fn();
		render(
			<AvailabilityRangeCalendar
				ranges={[
					{
						id: 'busy',
						apartmentId: 'one',
						start: '2026-08-13',
						end: '2026-08-14'
					}
				]}
				checkIn=""
				checkOut=""
				onChange={onChange}
			/>
		);
		fireEvent.click(screen.getByRole('gridcell', { name: '2026-08-12, slobodno' }));
		fireEvent.click(screen.getByRole('gridcell', { name: '2026-08-15, slobodno' }));
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(screen.getByText(/prelazi preko zauzetih dana/i)).toBeVisible();
	});
});
