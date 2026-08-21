import { NextResponse } from 'next/server';
import { invalidateAccessCache, isSuperAdminEmail } from '@auth/access';
import { requireFullAdmin } from '@/lib/auth/requireAdmin';
import { stayUserSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { StayUser } from '@/lib/stay/types';

type Context = {
	params: Promise<{
		id: string;
	}>;
};

export async function PATCH(request: Request, context: Context) {
	const guard = await requireFullAdmin();

	if ('response' in guard) {
		return guard.response;
	}

	const { id } = await context.params;
	const payload = stayUserSchema.partial().safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	const data = await readStayData();
	const existing = data.users.find((user) => user.id === id);

	if (!existing) {
		return NextResponse.json({ error: 'Korisnik nije pronadjen.' }, { status: 404 });
	}

	if (isSuperAdminEmail(existing.email) && (payload.data.role === 'owner' || payload.data.status === 'disabled')) {
		return NextResponse.json({ error: 'Vlasnicki nalog aplikacije ne moze biti izmenjen.' }, { status: 400 });
	}

	if (payload.data.email && data.users.some((user) => user.id !== id && user.email === payload.data.email)) {
		return NextResponse.json({ error: 'Korisnik sa ovom email adresom vec postoji.' }, { status: 409 });
	}

	const nextRole = payload.data.role ?? existing.role;
	const requestedApartmentIds = payload.data.apartmentIds ?? existing.apartmentIds;
	const apartmentIds = requestedApartmentIds.filter((apartmentId) =>
		data.apartments.some((apartment) => apartment.id === apartmentId)
	);

	if (nextRole === 'owner' && apartmentIds.length === 0) {
		return NextResponse.json({ error: 'Vlasnik mora imati bar jedan dodeljen apartman.' }, { status: 400 });
	}

	const updated: StayUser = {
		...existing,
		...payload.data,
		role: nextRole,
		apartmentIds: nextRole === 'admin' ? [] : apartmentIds
	};

	await updateStayData((current) => ({
		...current,
		users: current.users.map((user) => (user.id === id ? updated : user))
	}));

	invalidateAccessCache();

	return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: Context) {
	const guard = await requireFullAdmin();

	if ('response' in guard) {
		return guard.response;
	}

	const { id } = await context.params;
	const data = await readStayData();
	const existing = data.users.find((user) => user.id === id);

	if (!existing) {
		return NextResponse.json({ error: 'Korisnik nije pronadjen.' }, { status: 404 });
	}

	if (isSuperAdminEmail(existing.email)) {
		return NextResponse.json({ error: 'Vlasnicki nalog aplikacije ne moze biti obrisan.' }, { status: 400 });
	}

	if (existing.email === guard.context.email) {
		return NextResponse.json({ error: 'Ne mozes obrisati sopstveni nalog.' }, { status: 400 });
	}

	await updateStayData((current) => ({
		...current,
		users: current.users.filter((user) => user.id !== id)
	}));

	invalidateAccessCache();

	return NextResponse.json({ success: true });
}
