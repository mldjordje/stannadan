import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { invalidateAccessCache } from '@auth/access';
import { requireFullAdmin } from '@/lib/auth/requireAdmin';
import { stayUserSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { StayUser } from '@/lib/stay/types';

export async function GET() {
	const guard = await requireFullAdmin();

	if ('response' in guard) {
		return guard.response;
	}

	const data = await readStayData();

	return NextResponse.json(data.users);
}

export async function POST(request: Request) {
	const guard = await requireFullAdmin();

	if ('response' in guard) {
		return guard.response;
	}

	const payload = stayUserSchema.safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	const data = await readStayData();

	if (data.users.some((user) => user.email === payload.data.email)) {
		return NextResponse.json({ error: 'Korisnik sa ovom email adresom vec postoji.' }, { status: 409 });
	}

	const apartmentIds = payload.data.apartmentIds.filter((apartmentId) =>
		data.apartments.some((apartment) => apartment.id === apartmentId)
	);

	if (payload.data.role === 'owner' && apartmentIds.length === 0) {
		return NextResponse.json({ error: 'Vlasnik mora imati bar jedan dodeljen apartman.' }, { status: 400 });
	}

	const user: StayUser = {
		id: randomUUID(),
		email: payload.data.email,
		displayName: payload.data.displayName,
		role: payload.data.role,
		apartmentIds: payload.data.role === 'admin' ? [] : apartmentIds,
		status: payload.data.status,
		notes: payload.data.notes,
		createdAt: new Date().toISOString(),
		createdBy: guard.context.email
	};

	await updateStayData((current) => ({
		...current,
		users: [...current.users, user]
	}));

	invalidateAccessCache();

	return NextResponse.json(user, { status: 201 });
}
