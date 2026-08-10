import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const maxFileSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
	const unauthorized = await requireAdmin();

	if (unauthorized) {
		return unauthorized;
	}

	if (!process.env.BLOB_READ_WRITE_TOKEN) {
		return NextResponse.json({ error: 'Blob storage is not configured.' }, { status: 503 });
	}

	const formData = await request.formData();
	const file = formData.get('file');

	if (!(file instanceof File)) {
		return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
	}

	if (!allowedTypes.has(file.type)) {
		return NextResponse.json({ error: 'Only JPEG, PNG, WebP and AVIF images are allowed.' }, { status: 415 });
	}

	if (file.size > maxFileSize) {
		return NextResponse.json({ error: 'Image must be smaller than 8 MB.' }, { status: 413 });
	}

	const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
	const blob = await put(`apartments/${safeName}`, file, {
		access: 'public',
		addRandomSuffix: true,
		contentType: file.type
	});

	return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}
