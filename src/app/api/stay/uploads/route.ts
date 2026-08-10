import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const maxFileSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
	const unauthorized = await requireAdmin();

	if (unauthorized) {
		return unauthorized;
	}

	if (!process.env.BLOB_READ_WRITE_TOKEN) {
		return NextResponse.json({ error: 'Blob storage is not configured.' }, { status: 503 });
	}

	try {
		const body = (await request.json()) as HandleUploadBody;
		const response = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname) => {
				if (!pathname.startsWith('apartments/')) {
					throw new Error('Invalid upload destination.');
				}

				return {
					allowedContentTypes: allowedTypes,
					maximumSizeInBytes: maxFileSize,
					addRandomSuffix: true,
					allowOverwrite: false
				};
			}
		});

		return NextResponse.json(response);
	} catch (error) {
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Image upload could not be authorized.' },
			{ status: 400 }
		);
	}
}
