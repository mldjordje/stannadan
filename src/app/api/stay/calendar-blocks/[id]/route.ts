import { NextResponse } from 'next/server';
import { calendarBlockSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { canManageApartment, requirePanelUser } from '@/lib/auth/requireAdmin';

type Context = {
	params: Promise<{
		id: string;
	}>;
};

export async function PATCH(request: Request, context: Context) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const { id } = await context.params;
	const payload = calendarBlockSchema.partial().safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	const data = await readStayData();
	const existing = data.calendarBlocks.find((block) => block.id === id);

	if (!existing || !canManageApartment(guard.context, existing.apartmentId)) {
		return NextResponse.json({ error: 'Calendar block not found.' }, { status: 404 });
	}

	if (payload.data.apartmentId && !canManageApartment(guard.context, payload.data.apartmentId)) {
		return NextResponse.json({ error: 'Nemas pristup ovom apartmanu.' }, { status: 403 });
	}

	let updatedBlock = null;

	await updateStayData((current) => {
		const calendarBlocks = current.calendarBlocks.map((block) => {
			if (block.id !== id) {
				return block;
			}

			updatedBlock = {
				...block,
				...payload.data
			};

			return updatedBlock;
		});

		return {
			...current,
			calendarBlocks
		};
	});

	if (!updatedBlock) {
		return NextResponse.json({ error: 'Calendar block not found.' }, { status: 404 });
	}

	return NextResponse.json(updatedBlock);
}

export async function DELETE(_: Request, context: Context) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const { id } = await context.params;
	const data = await readStayData();
	const existing = data.calendarBlocks.find((block) => block.id === id);

	if (!existing || !canManageApartment(guard.context, existing.apartmentId)) {
		return NextResponse.json({ error: 'Calendar block not found.' }, { status: 404 });
	}

	await updateStayData((current) => ({
		...current,
		calendarBlocks: current.calendarBlocks.filter((block) => block.id !== id)
	}));

	return NextResponse.json({ success: true });
}
