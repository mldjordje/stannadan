import { Apartment, StayData } from './types';

function pad(value: number) {
	return `${value}`.padStart(2, '0');
}

function toUtcStamp(value: string) {
	const date = new Date(value);
	return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function toAllDayStamp(value: string) {
	const date = new Date(value);
	return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}

function escapeIcs(value: string) {
	return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildApartmentIcs(apartment: Apartment, data: StayData) {
	const reservations = data.reservations.filter(
		(reservation) => reservation.apartmentId === apartment.id && reservation.status !== 'cancelled'
	);
	const blocks = data.calendarBlocks.filter((block) => block.apartmentId === apartment.id);
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Stan na Dan Nis//Calendar Sync//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH'
	];

	reservations.forEach((reservation) => {
		lines.push(
			'BEGIN:VEVENT',
			`UID:${reservation.id}@stannadannis`,
			`DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
			`DTSTART;VALUE=DATE:${toAllDayStamp(reservation.checkIn)}`,
			`DTEND;VALUE=DATE:${toAllDayStamp(reservation.checkOut)}`,
			`SUMMARY:${escapeIcs(`Reserved - ${reservation.guestName}`)}`,
			`DESCRIPTION:${escapeIcs(`Source: ${reservation.source}; Status: ${reservation.status}`)}`,
			'END:VEVENT'
		);
	});

	blocks.forEach((block) => {
		lines.push(
			'BEGIN:VEVENT',
			`UID:${block.id}@stannadannis`,
			`DTSTAMP:${toUtcStamp(new Date().toISOString())}`,
			`DTSTART;VALUE=DATE:${toAllDayStamp(block.start)}`,
			`DTEND;VALUE=DATE:${toAllDayStamp(block.end)}`,
			`SUMMARY:${escapeIcs(block.title)}`,
			`DESCRIPTION:${escapeIcs(block.notes || block.type)}`,
			'END:VEVENT'
		);
	});

	lines.push('END:VCALENDAR');

	return `${lines.join('\r\n')}\r\n`;
}

export function parseIcsEvents(icsContent: string) {
	const rawEvents = icsContent.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];

	return rawEvents
		.map((rawEvent) => {
			const startMatch =
				rawEvent.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/) ?? rawEvent.match(/DTSTART.*:(\d{8})/);
			const endMatch =
				rawEvent.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/) ?? rawEvent.match(/DTEND.*:(\d{8})/);
			const summaryMatch = rawEvent.match(/SUMMARY:(.+)/);

			if (!startMatch || !endMatch) {
				return null;
			}

			const toDate = (value: string) =>
				`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;

			return {
				checkIn: toDate(startMatch[1]),
				checkOut: toDate(endMatch[1]),
				title: summaryMatch?.[1]?.trim() || 'Booking.com reservation'
			};
		})
		.filter(Boolean);
}
