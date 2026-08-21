import { blockLabels, coversNight } from './labels';
import type { Apartment, CalendarBlock, Reservation } from './types';

export type DayState = 'free' | 'occupied' | 'arrival' | 'departure' | 'turnover' | 'blocked';

export type ApartmentDay = {
	apartment: Apartment;
	day: string;
	state: DayState;
	/** Hour from which a new guest may enter, `null` when the unit is taken all day. */
	availableFrom: string | null;
	/** Hour until which the unit is still free, `null` when it is free until the end of the day. */
	availableUntil: string | null;
	label: string;
	stay: Reservation | null;
	departing: Reservation | null;
	arriving: Reservation | null;
	block: CalendarBlock | null;
};

function laterOf(first: string, second: string) {
	return first > second ? first : second;
}

export function checkInHour(apartment: Apartment, reservation?: Reservation | null) {
	return reservation?.checkInTime || apartment.checkInFrom || '14:00';
}

export function checkOutHour(apartment: Apartment, reservation?: Reservation | null) {
	return reservation?.checkOutTime || apartment.checkOutUntil || '11:00';
}

/**
 * Availability of one apartment on one calendar day, expressed in hours rather than
 * whole days: a stay that ends at 11:00 leaves the unit free for the rest of that day,
 * and a new guest may enter from the apartment's check-in hour.
 */
export function apartmentDay(
	apartment: Apartment,
	day: string,
	reservations: Reservation[],
	blocks: CalendarBlock[]
): ApartmentDay {
	const relevant = reservations.filter(
		(reservation) => reservation.apartmentId === apartment.id && reservation.status !== 'cancelled'
	);
	const stay = relevant.find((reservation) => coversNight(reservation.checkIn, reservation.checkOut, day)) ?? null;
	const departing = relevant.find((reservation) => reservation.checkOut === day) ?? null;
	const arriving = stay && stay.checkIn === day ? stay : null;
	const block =
		blocks.find((item) => item.apartmentId === apartment.id && coversNight(item.start, item.end, day)) ?? null;

	const base = { apartment, day, stay, departing, arriving, block };

	if (block) {
		return {
			...base,
			state: 'blocked',
			availableFrom: null,
			availableUntil: null,
			label: `${blockLabels[block.type]}${block.title ? ` · ${block.title}` : ''}`
		};
	}

	// Somebody leaves and somebody else arrives on the same day.
	if (departing && arriving) {
		const out = checkOutHour(apartment, departing);
		const entry = checkInHour(apartment, arriving);

		return {
			...base,
			state: 'turnover',
			availableFrom: null,
			availableUntil: null,
			label: `Odlazak ${out} → dolazak ${entry}`
		};
	}

	if (departing) {
		const out = checkOutHour(apartment, departing);
		const entry = laterOf(out, apartment.checkInFrom || '14:00');

		return {
			...base,
			state: 'departure',
			availableFrom: entry,
			availableUntil: null,
			label: `Zauzeto do ${out} · slobodno za ulazak od ${entry}`
		};
	}

	if (arriving) {
		const entry = checkInHour(apartment, arriving);

		return {
			...base,
			state: 'arrival',
			availableFrom: null,
			availableUntil: entry,
			label: `Slobodno do ${entry} · gost stize u ${entry}`
		};
	}

	if (stay) {
		return {
			...base,
			state: 'occupied',
			availableFrom: null,
			availableUntil: null,
			label: 'Zauzeto ceo dan'
		};
	}

	const entry = apartment.checkInFrom || '14:00';

	return {
		...base,
		state: 'free',
		availableFrom: entry,
		availableUntil: null,
		label: `Slobodno ceo dan · ulazak od ${entry}`
	};
}

export function dayOverview(
	apartments: Apartment[],
	day: string,
	reservations: Reservation[],
	blocks: CalendarBlock[]
) {
	const rows = apartments.map((apartment) => apartmentDay(apartment, day, reservations, blocks));
	// A unit still counts as bookable when it frees up during the day.
	const bookable = rows.filter((row) => row.state === 'free' || row.state === 'departure');

	return {
		day,
		rows,
		bookable,
		freeCount: bookable.length,
		total: apartments.length,
		arrivals: rows.filter((row) => row.arriving).length,
		departures: rows.filter((row) => row.departing).length
	};
}

export const stateColors: Record<DayState, string> = {
	free: '#10b981',
	departure: '#22c55e',
	arrival: '#f59e0b',
	turnover: '#f97316',
	occupied: '#ef4444',
	blocked: '#64748b'
};

export const stateLabels: Record<DayState, string> = {
	free: 'Slobodno',
	departure: 'Oslobadja se',
	arrival: 'Dolazak',
	turnover: 'Smena gostiju',
	occupied: 'Zauzeto',
	blocked: 'Blokirano'
};
