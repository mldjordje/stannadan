import { absoluteUrl, siteUrl } from '@/lib/site';
import type { Apartment, PropertyProfile } from '@/lib/stay/types';

/**
 * schema.org data for the property and its units.
 * Google uses it for rich results on hotel and lodging queries.
 */
export default function StructuredData({
	property,
	apartments
}: {
	property: PropertyProfile;
	apartments: Pick<Apartment, 'slug' | 'name' | 'teaser' | 'pricePerNight' | 'coverImage' | 'guests'>[];
}) {
	const graph = [
		{
			'@type': 'LodgingBusiness',
			'@id': `${siteUrl}/#business`,
			name: property.name,
			description: property.description,
			url: siteUrl,
			telephone: property.phone,
			email: property.email,
			image: absoluteUrl(property.heroImage),
			priceRange: '€€',
			address: {
				'@type': 'PostalAddress',
				streetAddress: property.address,
				addressLocality: property.city,
				addressCountry: 'RS'
			},
			hasMap: property.googleMapsUrl
		},
		...apartments.map((apartment) => ({
			'@type': 'Accommodation',
			'@id': `${siteUrl}/apartments/${apartment.slug}#accommodation`,
			name: apartment.name,
			description: apartment.teaser,
			url: absoluteUrl(`/apartments/${apartment.slug}`),
			image: absoluteUrl(apartment.coverImage),
			occupancy: {
				'@type': 'QuantitativeValue',
				maxValue: apartment.guests
			},
			containedInPlace: { '@id': `${siteUrl}/#business` },
			offers: {
				'@type': 'Offer',
				price: apartment.pricePerNight,
				priceCurrency: 'EUR',
				url: absoluteUrl(`/apartments/${apartment.slug}`)
			}
		}))
	];

	return (
		<script
			type="application/ld+json"
			// The payload is built from our own data, never from user input.
			dangerouslySetInnerHTML={{
				__html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
			}}
		/>
	);
}
