/**
 * Single source of truth for the public origin.
 * Production is driven by NEXT_PUBLIC_BASE_URL, Vercel previews fall back to their own host.
 */
export const siteUrl = (
	process.env.NEXT_PUBLIC_BASE_URL ||
	(process.env.VERCEL_PROJECT_PRODUCTION_URL
		? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
		: 'http://localhost:3000')
).replace(/\/$/, '');

export function absoluteUrl(path = '/') {
	return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
