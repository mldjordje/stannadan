import { del } from '@vercel/blob';

function isManagedPublicBlobUrl(value: string) {
	try {
		const url = new URL(value);

		return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
	} catch {
		return false;
	}
}

export async function deleteManagedBlobUrls(values: string[]) {
	if (!process.env.BLOB_READ_WRITE_TOKEN) {
		return;
	}

	const urls = [...new Set(values.filter(isManagedPublicBlobUrl))];

	if (urls.length > 0) {
		await del(urls);
	}
}
