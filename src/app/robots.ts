import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/admin', '/api/', '/sign-in', '/sign-up', '/account']
			}
		],
		sitemap: absoluteUrl('/sitemap.xml'),
		host: absoluteUrl('/')
	};
}
