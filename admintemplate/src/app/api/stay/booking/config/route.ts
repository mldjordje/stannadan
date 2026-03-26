import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { bookingSyncSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { BookingSyncConfig, SyncLogEntry } from '@/lib/stay/types';

export async function GET() {
	const data = await readStayData();
	return NextResponse.json(data.bookingSync);
}

export async function PATCH(request: Request) {
	const payload = bookingSyncSchema.safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	const configData = payload.data as Pick<BookingSyncConfig, 'mode' | 'state' | 'propertyId' | 'notes' | 'mappings'>;

	await updateStayData((data) => ({
		...data,
		bookingSync: {
			...data.bookingSync,
			...configData,
			logs: (
				[
					{
						id: randomUUID(),
						status: 'success',
						message: 'Booking.com sync konfiguracija je azurirana.',
						createdAt: new Date().toISOString()
					},
					...data.bookingSync.logs
				] satisfies SyncLogEntry[]
			).slice(0, 10)
		}
	}));

	const next = await readStayData();
	return NextResponse.json(next.bookingSync);
}
