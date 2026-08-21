import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { calendarBlockSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { CalendarBlock } from '@/lib/stay/types';
import { canManageApartment, requirePanelUser } from '@/lib/auth/requireAdmin';

export async function GET() {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const data = await readStayData();

	return NextResponse.json(
		data.calendarBlocks.filter((block) => canManageApartment(guard.context, block.apartmentId))
	);
}

export async function POST(request: Request) {
	const guard = await requirePanelUser();

	if ('response' in guard) {
		return guard.response;
	}

	const payload = calendarBlockSchema.safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	if (!canManageApartment(guard.context, payload.data.apartmentId)) {
		return NextResponse.json({ error: 'Nemas pristup ovom apartmanu.' }, { status: 403 });
	}

	const blockData = payload.data as Omit<CalendarBlock, 'id'>;
	const block: CalendarBlock = {
		id: randomUUID(),
		...blockData
	};

	await updateStayData((data) => ({
		...data,
		calendarBlocks: [...data.calendarBlocks, block]
	}));

	return NextResponse.json(block, { status: 201 });
}
