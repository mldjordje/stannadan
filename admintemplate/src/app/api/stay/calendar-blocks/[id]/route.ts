import { NextResponse } from 'next/server';
import { calendarBlockSchema } from '@/lib/stay/schema';
import { updateStayData } from '@/lib/stay/store';

type Context = {
	params: Promise<{
		id: string;
	}>;
};

export async function PATCH(request: Request, context: Context) {
	const { id } = await context.params;
	const payload = calendarBlockSchema.partial().safeParse(await request.json());

	if (!payload.success) {
		return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
	}

	let updatedBlock = null;

	await updateStayData((data) => {
		const calendarBlocks = data.calendarBlocks.map((block) => {
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
			...data,
			calendarBlocks
		};
	});

	if (!updatedBlock) {
		return NextResponse.json({ error: 'Calendar block not found.' }, { status: 404 });
	}

	return NextResponse.json(updatedBlock);
}

export async function DELETE(_: Request, context: Context) {
	const { id } = await context.params;
	let removed = false;

	await updateStayData((data) => {
		const calendarBlocks = data.calendarBlocks.filter((block) => block.id !== id);
		removed = calendarBlocks.length !== data.calendarBlocks.length;

		return {
			...data,
			calendarBlocks
		};
	});

	if (!removed) {
		return NextResponse.json({ error: 'Calendar block not found.' }, { status: 404 });
	}

	return NextResponse.json({ success: true });
}
