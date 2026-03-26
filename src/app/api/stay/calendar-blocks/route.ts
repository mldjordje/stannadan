import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { calendarBlockSchema } from '@/lib/stay/schema';
import { readStayData, updateStayData } from '@/lib/stay/store';
import { CalendarBlock } from '@/lib/stay/types';

export async function GET() {
	const data = await readStayData();
	return NextResponse.json(data.calendarBlocks);
}

export async function POST(request: Request) {
	const payload = calendarBlockSchema.safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
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
