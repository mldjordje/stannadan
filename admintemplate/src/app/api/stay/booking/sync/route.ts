import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { parseIcsEvents } from '@/lib/stay/ical';
import { updateStayData } from '@/lib/stay/store';

export async function POST() {
	const syncLogs: {
		id: string;
		status: 'success' | 'warning' | 'error';
		message: string;
		createdAt: string;
	}[] = [];

	await updateStayData(async (data) => {
		const bookingReservations = data.reservations.filter((reservation) => reservation.source === 'booking.com');
		const preservedReservations = data.reservations.filter((reservation) => reservation.source !== 'booking.com');
		const importedReservations = [];

		for (const mapping of data.bookingSync.mappings) {
			if (!mapping.importUrl) {
				syncLogs.push({
					id: randomUUID(),
					status: 'warning',
					message: `Preskocen ${mapping.roomName} jer Booking.com import URL nije dodat.`,
					createdAt: new Date().toISOString()
				});
				continue;
			}

			try {
				const response = await fetch(mapping.importUrl, { cache: 'no-store' });

				if (!response.ok) {
					throw new Error(`Import URL returned ${response.status}`);
				}

				const icsContent = await response.text();
				const events = parseIcsEvents(icsContent);

				events.forEach((event, index) => {
					importedReservations.push({
						id: `booking-${mapping.apartmentId}-${index + 1}`,
						apartmentId: mapping.apartmentId,
						guestName: event.title,
						guestEmail: 'booking-sync@booking.com',
						guestPhone: 'N/A',
						checkIn: event.checkIn,
						checkOut: event.checkOut,
						guests: 2,
						totalPrice: 0,
						source: 'booking.com' as const,
						status: 'confirmed' as const,
						notes: 'Automatski importovano preko Booking.com iCal feed-a.',
						createdAt: new Date().toISOString()
					});
				});

				syncLogs.push({
					id: randomUUID(),
					status: 'success',
					message: `${mapping.roomName}: importovano ${events.length} booking.com dogadjaja.`,
					createdAt: new Date().toISOString()
				});
			} catch (error) {
				syncLogs.push({
					id: randomUUID(),
					status: 'error',
					message: `${mapping.roomName}: sync nije uspeo (${(error as Error).message}).`,
					createdAt: new Date().toISOString()
				});
			}
		}

		return {
			...data,
			reservations: [...preservedReservations, ...importedReservations],
			bookingSync: {
				...data.bookingSync,
				state: syncLogs.some((log) => log.status === 'error')
					? 'attention'
					: importedReservations.length > 0
						? 'configured'
						: data.bookingSync.state,
				lastSyncAt: new Date().toISOString(),
				logs: [...syncLogs, ...data.bookingSync.logs].slice(0, 12)
			}
		};
	});

	return NextResponse.json({
		success: true,
		message:
			syncLogs.length > 0
				? syncLogs[0].message
				: `Nema import URL-ova. Postavi Booking.com iCal link pre prve sinhronizacije.`
	});
}
