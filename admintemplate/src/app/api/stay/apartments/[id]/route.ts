import { NextResponse } from 'next/server';
import { apartmentSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';

type Context = {
	params: Promise<{
		id: string;
	}>;
};

export async function GET(_: Request, context: Context) {
	const { id } = await context.params;
	const data = await readStayData();
	const apartment = data.apartments.find((item) => item.id === id);

	if (!apartment) {
		return NextResponse.json({ error: 'Apartment not found.' }, { status: 404 });
	}

	return NextResponse.json(apartment);
}

export async function PATCH(request: Request, context: Context) {
	const { id } = await context.params;
	const payload = apartmentSchema.partial().safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	let updatedApartment = null;

	await updateStayData((data) => {
		const apartments = data.apartments.map((apartment) => {
			if (apartment.id !== id) {
				return apartment;
			}

			updatedApartment = {
				...apartment,
				...payload.data
			};

			return updatedApartment;
		});

		return {
			...data,
			apartments,
			bookingSync: {
				...data.bookingSync,
				mappings: data.bookingSync.mappings.map((mapping) =>
					mapping.apartmentId === id && updatedApartment
						? {
								...mapping,
								roomName: updatedApartment.name
							}
						: mapping
				)
			}
		};
	});

	if (!updatedApartment) {
		return NextResponse.json({ error: 'Apartment not found.' }, { status: 404 });
	}

	return NextResponse.json(updatedApartment);
}

export async function DELETE(_: Request, context: Context) {
	const { id } = await context.params;
	let removed = false;

	await updateStayData((data) => {
		const nextApartments = data.apartments.filter((item) => item.id !== id);
		removed = nextApartments.length !== data.apartments.length;

		return {
			...data,
			apartments: nextApartments,
			reservations: data.reservations.filter((reservation) => reservation.apartmentId !== id),
			calendarBlocks: data.calendarBlocks.filter((block) => block.apartmentId !== id),
			bookingSync: {
				...data.bookingSync,
				mappings: data.bookingSync.mappings.filter((mapping) => mapping.apartmentId !== id)
			}
		};
	});

	if (!removed) {
		return NextResponse.json({ error: 'Apartment not found.' }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
