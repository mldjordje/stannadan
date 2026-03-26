import { NextResponse } from 'next/server';
import { buildApartmentIcs } from '@/lib/stay/ical';
import { readStayData } from '@/lib/stay/store';

type Context = {
	params: Promise<{
		apartmentId: string;
	}>;
};

export async function GET(_: Request, context: Context) {
	const { apartmentId } = await context.params;
	const data = await readStayData();
	const apartment = data.apartments.find((item) => item.id === apartmentId);

	if (!apartment) {
		return NextResponse.json({ error: 'Apartment not found.' }, { status: 404 });
	}

	return new Response(buildApartmentIcs(apartment, data), {
		status: 200,
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': `inline; filename="${apartment.slug}.ics"`
		}
	});
}
