import { NextResponse } from 'next/server';
import { apartmentSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { deleteManagedBlobUrls } from '@/lib/stay/blob';

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
	const unauthorized = await requireAdmin();

	if (unauthorized) return unauthorized;

	const { id } = await context.params;
	const payload = apartmentSchema.partial().safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	let updatedApartment = null;
	let previousImages: string[] = [];

	const nextData = await updateStayData((data) => {
		const apartments = data.apartments.map((apartment) => {
			if (apartment.id !== id) {
				return apartment;
			}

			previousImages = [apartment.coverImage, ...apartment.gallery];
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

	const retainedImages = new Set(
		nextData.apartments.flatMap((apartment) => [apartment.coverImage, ...apartment.gallery])
	);
	const removedImages = previousImages.filter((image) => !retainedImages.has(image));

	try {
		await deleteManagedBlobUrls(removedImages);
	} catch (error) {
		console.error('Apartment images could not be removed from Blob storage.', error);
	}

	return NextResponse.json(updatedApartment);
}

export async function DELETE(_: Request, context: Context) {
	const unauthorized = await requireAdmin();

	if (unauthorized) return unauthorized;

	const { id } = await context.params;
	let removed = false;
	let removedImages: string[] = [];

	const nextData = await updateStayData((data) => {
		const apartment = data.apartments.find((item) => item.id === id);
		removedImages = apartment ? [apartment.coverImage, ...apartment.gallery] : [];
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

	const retainedImages = new Set(
		nextData.apartments.flatMap((apartment) => [apartment.coverImage, ...apartment.gallery])
	);

	try {
		await deleteManagedBlobUrls(removedImages.filter((image) => !retainedImages.has(image)));
	} catch (error) {
		console.error('Apartment images could not be removed from Blob storage.', error);
	}

	return NextResponse.json({ success: true });
}
