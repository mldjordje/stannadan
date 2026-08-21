import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { apartmentSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { Apartment } from '@/lib/stay/types';
import { requirePanelUser } from '@/lib/auth/requireAdmin';
import { invalidateAccessCache } from '@auth/access';

export async function GET() {
	const data = await readStayData();
	return NextResponse.json(data.apartments);
}

export async function POST(request: Request) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

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
		// An owner who adds an apartment becomes its manager straight away.
		users: data.users.map((user) =>
			user.role === 'owner' && user.email === guard.context.email
				? { ...user, apartmentIds: [...user.apartmentIds, apartment.id] }
				: user
		),
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

	invalidateAccessCache();

	return NextResponse.json(apartment, { status: 201 });
}
