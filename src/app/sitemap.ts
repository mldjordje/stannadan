import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';
import { readStayData } from '@/lib/stay/store';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const data = await readStayData().catch(() => null);
	const lastModified = new Date();

	const staticRoutes: MetadataRoute.Sitemap = [
		{ url: absoluteUrl('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
		{ url: absoluteUrl('/apartments'), lastModified, changeFrequency: 'weekly', priority: 0.9 },
		{ url: absoluteUrl('/availability'), lastModified, changeFrequency: 'daily', priority: 0.8 },
		{ url: absoluteUrl('/contact'), lastModified, changeFrequency: 'monthly', priority: 0.5 }
	];

	const apartmentRoutes: MetadataRoute.Sitemap = (data?.apartments ?? []).map((apartment) => ({
		url: absoluteUrl(`/apartments/${apartment.slug}`),
		lastModified,
		changeFrequency: 'weekly',
		priority: 0.8
	}));

	return [...staticRoutes, ...apartmentRoutes];
}
