import { NextResponse } from 'next/server';
import { readStayData } from '@/lib/stay/store';

export async function GET() {
	const data = await readStayData();
	return NextResponse.json(data);
}
