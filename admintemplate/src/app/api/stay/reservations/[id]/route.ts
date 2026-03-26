import { NextResponse } from 'next/server';
import { reservationSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';

type Context = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(_: Request, context: Context) {
	const { id } = await context.params;
	const data = await readStayData();
	const reservation = data.reservations.find((item) => item.id === id);

	if (!reservation) {
		return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
	}

	return NextResponse.json(reservation);
}

export async function PATCH(request: Request, context: Context) {
	const { id } = await context.params;
	const payload = reservationSchema.partial().safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	let updatedReservation = null;

	await updateStayData((data) => {
		const reservations = data.reservations.map((reservation) => {
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
			...data,
			reservations
		};
	});

	if (!updatedReservation) {
		return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
	}

	return NextResponse.json(updatedReservation);
}

export async function DELETE(_: Request, context: Context) {
	const { id } = await context.params;
	let removed = false;

	await updateStayData((data) => {
		const reservations = data.reservations.filter((reservation) => reservation.id !== id);
		removed = reservations.length !== data.reservations.length;

		return {
			...data,
			reservations
		};
	});

	if (!removed) {
		return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
