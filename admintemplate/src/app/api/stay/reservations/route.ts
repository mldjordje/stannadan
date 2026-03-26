import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { calculateReservationTotal } from '@/lib/stay/format';
import { reservationSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { Reservation } from '@/lib/stay/types';

export async function GET(request: Request) {
	const url = new URL(request.url);
	const apartmentId = url.searchParams.get('apartmentId');
	const guestEmail = url.searchParams.get('guestEmail');
	const source = url.searchParams.get('source');
	const status = url.searchParams.get('status');
	const data = await readStayData();

	const reservations = data.reservations.filter((reservation) => {
		if (apartmentId && reservation.apartmentId !== apartmentId) {
			return false;
		}

		if (guestEmail && reservation.guestEmail !== guestEmail) {
			return false;
		}

		if (source && reservation.source !== source) {
			return false;
		}

		if (status && reservation.status !== status) {
			return false;
		}

		return true;
	});

	return NextResponse.json(reservations);
}

export async function POST(request: Request) {
	const payload = reservationSchema.safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	const data = await readStayData();
	const apartment = data.apartments.find((item) => item.id === payload.data.apartmentId);

	if (!apartment) {
		return NextResponse.json({ error: 'Apartment not found.' }, { status: 404 });
	}

	const reservationData = payload.data as Omit<Reservation, 'id' | 'createdAt' | 'totalPrice'> & {
		totalPrice?: number;
	};
	const reservation: Reservation = {
		id: randomUUID(),
		...reservationData,
		totalPrice:
			reservationData.totalPrice ??
			calculateReservationTotal(apartment, reservationData.checkIn, reservationData.checkOut),
		createdAt: new Date().toISOString()
	};

	await updateStayData((current) => ({
		...current,
		reservations: [...current.reservations, reservation]
	}));

	return NextResponse.json(reservation, { status: 201 });
}
