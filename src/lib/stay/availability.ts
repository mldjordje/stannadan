import { CalendarBlock, Reservation, StayData } from './types';

function toKey(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Every occupied day between start (inclusive) and end (exclusive). */
function expand(start: string, end: string) {
	const days: string[] = [];
	const cursor = new Date(start);
	const last = new Date(end);

	while (cursor < last) {
		days.push(toKey(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}

	return days;
}

/**
 * Day keys an apartment cannot be booked on: confirmed/pending stays plus
 * cleaning, maintenance and owner blocks. Same source the admin panel edits.
 */
export function getBlockedDays(data: StayData, apartmentId: string) {
	const stays = data.reservations
		.filter((reservation: Reservation) => reservation.apartmentId === apartmentId)
		.filter((reservation) => reservation.status !== 'cancelled')
		.flatMap((reservation) => expand(reservation.checkIn, reservation.checkOut));

	const blocks = data.calendarBlocks
		.filter((block: CalendarBlock) => block.apartmentId === apartmentId)
		.flatMap((block) => expand(block.start, block.end));

	return Array.from(new Set([...stays, ...blocks])).sort();
}

/** Next free night from today, useful for "available tonight" messaging. */
export function getNextFreeDay(blocked: string[]) {
	const taken = new Set(blocked);
	const cursor = new Date();

	for (let index = 0; index < 400; index += 1) {
		const candidate = toKey(cursor);

		if (!taken.has(candidate)) {
			return candidate;
		}

		cursor.setDate(cursor.getDate() + 1);
	}

	return toKey(cursor);
}
