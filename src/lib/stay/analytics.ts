import { addDays, coversNight, toIsoDate } from './labels';
import { getNights } from './format';
import type { Apartment, BookingSource, CalendarBlock, Reservation } from './types';

/** Revenue attributed to a single night, so a stay spanning two months is split fairly. */
export function nightlyValue(reservation: Reservation) {
	return reservation.totalPrice / getNights(reservation.checkIn, reservation.checkOut);
}

export function activeReservations(reservations: Reservation[]) {
	return reservations.filter((reservation) => reservation.status !== 'cancelled');
}

export function daysBetween(start: string, count: number) {
	return Array.from({ length: count }, (_, index) => addDays(start, index));
}

export function monthKeys(anchor: string, count: number) {
	const [year, month] = anchor.split('-').map(Number);

	return Array.from({ length: count }, (_, index) => {
		const date = new Date(year, month - 1 - (count - 1 - index), 1);

		return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
	});
}

export function monthDays(monthKey: string) {
	const [year, month] = monthKey.split('-').map(Number);
	const total = new Date(year, month, 0).getDate();

	return Array.from({ length: total }, (_, index) => `${monthKey}-${`${index + 1}`.padStart(2, '0')}`);
}

export type PeriodMetrics = {
	revenue: number;
	soldNights: number;
	availableNights: number;
	occupancy: number;
	/** Average daily rate: revenue per sold night. */
	adr: number;
	/** Revenue per available night. */
	revpar: number;
};

export function metricsForDays(days: string[], reservations: Reservation[], apartments: Apartment[]): PeriodMetrics {
	const active = activeReservations(reservations);
	let revenue = 0;
	let soldNights = 0;

	days.forEach((day) => {
		active.forEach((reservation) => {
			if (coversNight(reservation.checkIn, reservation.checkOut, day)) {
				revenue += nightlyValue(reservation);
				soldNights += 1;
			}
		});
	});

	const availableNights = days.length * apartments.length;

	return {
		revenue,
		soldNights,
		availableNights,
		occupancy: availableNights ? soldNights / availableNights : 0,
		adr: soldNights ? revenue / soldNights : 0,
		revpar: availableNights ? revenue / availableNights : 0
	};
}

export function occupiedApartmentIds(day: string, reservations: Reservation[], blocks: CalendarBlock[]): Set<string> {
	return new Set([
		...activeReservations(reservations)
			.filter((reservation) => coversNight(reservation.checkIn, reservation.checkOut, day))
			.map((reservation) => reservation.apartmentId),
		...blocks.filter((block) => coversNight(block.start, block.end, day)).map((block) => block.apartmentId)
	]);
}

export function revenueBySource(reservations: Reservation[]): Record<BookingSource, number> {
	const totals: Record<BookingSource, number> = { direct: 0, 'booking.com': 0, manual: 0 };

	activeReservations(reservations).forEach((reservation) => {
		totals[reservation.source] += reservation.totalPrice;
	});

	return totals;
}

export type GuestRecord = {
	key: string;
	name: string;
	email: string;
	phone: string;
	stays: number;
	nights: number;
	spend: number;
	lastStay: string;
	nextStay: string | null;
	apartmentIds: string[];
	sources: BookingSource[];
};

/** Groups reservations into a guest directory keyed by email, falling back to phone then name. */
export function buildGuestDirectory(reservations: Reservation[]): GuestRecord[] {
	const today = toIsoDate(new Date());
	const map = new Map<string, GuestRecord>();

	activeReservations(reservations).forEach((reservation) => {
		const key = (reservation.guestEmail || reservation.guestPhone || reservation.guestName).trim().toLowerCase();

		if (!key) {
			return;
		}

		const existing = map.get(key);
		const nights = getNights(reservation.checkIn, reservation.checkOut);

		if (!existing) {
			map.set(key, {
				key,
				name: reservation.guestName,
				email: reservation.guestEmail,
				phone: reservation.guestPhone,
				stays: 1,
				nights,
				spend: reservation.totalPrice,
				lastStay: reservation.checkOut,
				nextStay: reservation.checkIn >= today ? reservation.checkIn : null,
				apartmentIds: [reservation.apartmentId],
				sources: [reservation.source]
			});
			return;
		}

		existing.stays += 1;
		existing.nights += nights;
		existing.spend += reservation.totalPrice;
		existing.lastStay = reservation.checkOut > existing.lastStay ? reservation.checkOut : existing.lastStay;

		if (reservation.checkIn >= today && (!existing.nextStay || reservation.checkIn < existing.nextStay)) {
			existing.nextStay = reservation.checkIn;
		}

		if (!existing.apartmentIds.includes(reservation.apartmentId)) {
			existing.apartmentIds.push(reservation.apartmentId);
		}

		if (!existing.sources.includes(reservation.source)) {
			existing.sources.push(reservation.source);
		}

		if (!existing.email && reservation.guestEmail) {
			existing.email = reservation.guestEmail;
		}

		if (!existing.phone && reservation.guestPhone) {
			existing.phone = reservation.guestPhone;
		}
	});

	return [...map.values()].sort((first, second) => second.spend - first.spend);
}
