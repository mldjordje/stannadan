import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { apartmentSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { Apartment } from '@/lib/stay/types';

export async function GET() {
	const data = await readStayData();
	return NextResponse.json(data.apartments);
}

export async function POST(request: Request) {
	const payload = apartmentSchema.safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	const apartmentData = payload.data as Omit<Apartment, 'id'>;
	const apartment: Apartment = {
		id: randomUUID(),
		...apartmentData
	};

	await updateStayData((data) => ({
		...data,
		apartments: [...data.apartments, apartment],
		bookingSync: {
			...data.bookingSync,
			mappings: [
				...data.bookingSync.mappings,
				{
					apartmentId: apartment.id,
					roomName: apartment.name,
					importUrl: '',
					exportPath: `/api/stay/ical/${apartment.id}`
				}
			]
		}
	}));

	return NextResponse.json(apartment, { status: 201 });
}
