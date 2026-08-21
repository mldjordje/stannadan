import { NextResponse } from 'next/server';
import { reservationSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { canManageApartment, requirePanelUser } from '@/lib/auth/requireAdmin';

type Context = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(_: Request, context: Context) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const { id } = await context.params;
	const data = await readStayData();
	const reservation = data.reservations.find((item) => item.id === id);

	if (!reservation || !canManageApartment(guard.context, reservation.apartmentId)) {
		return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
	}

	return NextResponse.json(reservation);
}

export async function PATCH(request: Request, context: Context) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const { id } = await context.params;
	const payload = reservationSchema.partial().safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	const data = await readStayData();
	const existing = data.reservations.find((item) => item.id === id);

	if (!existing || !canManageApartment(guard.context, existing.apartmentId)) {
		return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
	}

	if (payload.data.apartmentId && !canManageApartment(guard.context, payload.data.apartmentId)) {
		return NextResponse.json({ error: 'Nemas pristup ovom apartmanu.' }, { status: 403 });
	}

	let updatedReservation = null;

	await updateStayData((current) => {
		const reservations = current.reservations.map((reservation) => {
			if (reservation.id !== id) {
				return reservation;
			}

			updatedReservation = {
				...reservation,
				...payload.data
			};

			return updatedReservation;
		});

		return {
			...current,
			reservations
		};
	});

	if (!updatedReservation) {
		return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
	}

	return NextResponse.json(updatedReservation);
}

export async function DELETE(_: Request, context: Context) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const { id } = await context.params;
	const data = await readStayData();
	const existing = data.reservations.find((item) => item.id === id);

	if (!existing || !canManageApartment(guard.context, existing.apartmentId)) {
		return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
	}

	await updateStayData((current) => ({
		...current,
		reservations: current.reservations.filter((reservation) => reservation.id !== id)
	}));

	return NextResponse.json({ success: true });
}
