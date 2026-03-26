import { Apartment, CalendarBlock, CalendarEventRecord, Reservation, StayData } from './types';

export function formatCurrency(value: number) {
	return new Intl.NumberFormat('sr-RS', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	}).format(value);
}

export function getNights(checkIn: string, checkOut: string) {
	const start = new Date(checkIn);
	const end = new Date(checkOut);
	return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
}

export function formatDate(value: string) {
	return new Intl.DateTimeFormat('sr-RS', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));
}

export function formatDateRange(checkIn: string, checkOut: string) {
	return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

export function getApartmentById(apartments: Apartment[], apartmentId: string) {
	return apartments.find((apartment) => apartment.id === apartmentId) ?? null;
}

export function toCalendarEvents(data: StayData): CalendarEventRecord[] {
	const reservationEvents = data.reservations
		.filter((reservation) => reservation.status !== 'cancelled')
		.map((reservation) => ({
			id: reservation.id,
			apartmentId: reservation.apartmentId,
			title: `${reservation.guestName} (${reservation.source})`,
			start: reservation.checkIn,
			end: reservation.checkOut,
			status: reservation.status,
			source: reservation.source,
			guestName: reservation.guestName
		}));

	const blockEvents = data.calendarBlocks.map((block: CalendarBlock) => ({
		id: block.id,
		apartmentId: block.apartmentId,
		title: block.title,
		start: block.start,
		end: block.end,
		status: block.type,
		source: 'calendar-block' as const
	}));

	return [...reservationEvents, ...blockEvents];
}

export function calculateReservationTotal(apartment: Apartment, checkIn: string, checkOut: string) {
	return apartment.pricePerNight * getNights(checkIn, checkOut) + apartment.cleaningFee;
}

export function sortReservations(reservations: Reservation[]) {
	return [...reservations].sort(
		(first, second) => new Date(first.checkIn).getTime() - new Date(second.checkIn).getTime()
	);
}
