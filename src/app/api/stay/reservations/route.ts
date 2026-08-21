import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { calculateReservationTotal } from '@/lib/stay/format';
import { reservationSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { Reservation } from '@/lib/stay/types';
import { canManageApartment, getAdminContext, requirePanelUser } from '@/lib/auth/requireAdmin';

export async function GET(request: Request) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const url = new URL(request.url);
	const apartmentId = url.searchParams.get('apartmentId');
	const guestEmail = url.searchParams.get('guestEmail');
	const source = url.searchParams.get('source');
	const status = url.searchParams.get('status');
	const data = await readStayData();

	const reservations = data.reservations.filter((reservation) => {
		if (!canManageApartment(guard.context, reservation.apartmentId)) {
			return false;
		}

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

	if (payload.data.checkOut <= payload.data.checkIn) {
		return NextResponse.json({ error: 'Check-out must be after check-in.' }, { status: 400 });
	}

	if (payload.data.guests > apartment.guests) {
		return NextResponse.json({ error: 'Guest count exceeds apartment capacity.' }, { status: 400 });
	}

	const overlaps = (start: string, end: string) => payload.data.checkIn < end && payload.data.checkOut > start;
	const unavailable =
		data.reservations.some(
			(reservation) =>
				reservation.apartmentId === apartment.id &&
				reservation.status !== 'cancelled' &&
				overlaps(reservation.checkIn, reservation.checkOut)
		) ||
		data.calendarBlocks.some((block) => block.apartmentId === apartment.id && overlaps(block.start, block.end));

	if (unavailable) {
		return NextResponse.json({ error: 'Apartment is not available for the selected dates.' }, { status: 409 });
	}

	const context = await getAdminContext();

	if (context && !canManageApartment(context, payload.data.apartmentId)) {
		return NextResponse.json({ error: 'Nemas pristup ovom apartmanu.' }, { status: 403 });
	}

	const admin = Boolean(context);
	const reservationData = payload.data as Omit<Reservation, 'id' | 'createdAt' | 'totalPrice'> & {
		totalPrice?: number;
	};
	const reservation: Reservation = {
		id: randomUUID(),
		...reservationData,
		source: admin ? reservationData.source : 'direct',
		status: admin ? reservationData.status : 'pending',
		totalPrice:
			(admin ? reservationData.totalPrice : undefined) ??
			calculateReservationTotal(apartment, reservationData.checkIn, reservationData.checkOut),
		createdAt: new Date().toISOString()
	};

	await updateStayData((current) => ({
		...current,
		reservations: [...current.reservations, reservation]
	}));

	return NextResponse.json(reservation, { status: 201 });
}
