import { type Apartment, type StayData } from '../stay/types';
import { cinematicMedia, type CinematicMedia } from './media';
import type { ApartmentChapter, LandingPresentation } from './types';

const cinematicMediaBySlug: Readonly<Record<string, CinematicMedia>> = {
	'fortress-loft': cinematicMedia.kitchen,
	'riverside-suite': cinematicMedia.living,
	'delta-family-suite': cinematicMedia.studio
};

const cinematicMediaInOrder = [
	cinematicMedia.kitchen,
	cinematicMedia.living,
	cinematicMedia.studio,
	cinematicMedia.hero
] as const;

function selectChapterMedia(apartment: Apartment, storedIndex: number): CinematicMedia {
	return cinematicMediaBySlug[apartment.slug] ?? cinematicMediaInOrder[storedIndex % cinematicMediaInOrder.length];
}

function buildMaterialFacts(apartment: Apartment | undefined): LandingPresentation['materialFacts'] {
	if (!apartment) {
		return [];
	}

	const facts = [
		{ value: `${apartment.size} m²`, label: 'Prostor' },
		{ value: `${apartment.guests}`, label: 'Gostiju' }
	];

	if (apartment.amenities.includes('Self check-in')) {
		facts.push({ value: 'Self check-in', label: 'Dolazak' });
	}

	return facts;
}

export function buildLandingPresentation(data: StayData): LandingPresentation {
	const chaptersApartments = data.apartments.some((apartment) => apartment.featured)
		? data.apartments.filter((apartment) => apartment.featured)
		: data.apartments;
	const chapters = chaptersApartments.map((apartment) => {
		const media = selectChapterMedia(apartment, data.apartments.indexOf(apartment));

		return {
			id: apartment.id,
			slug: apartment.slug,
			name: apartment.name,
			statement: `${apartment.name} — svetlo, san i prostor za dolazak u ${data.property.city}.`,
			location: apartment.locationNote,
			pricePerNight: apartment.pricePerNight,
			guests: apartment.guests,
			size: apartment.size,
			rating: apartment.rating,
			reviewCount: apartment.reviewCount,
			mobileImage: media.mobile,
			desktopImage: media.desktop,
			gallery: [...apartment.gallery]
		} satisfies ApartmentChapter;
	});

	return {
		city: data.property.city,
		propertyName: data.property.name,
		arrivalLine: `Dolazak u ${data.property.city} · ${data.property.address}`,
		introduction: `Mesto za dolazak, svetlo, san i prostor dok ste u ${data.property.city}.`,
		chapters,
		materialFacts: buildMaterialFacts(chaptersApartments[0]),
		neighborhood: data.property.neighborhood.map(({ label, distance }) => ({ label, distance })),
		trust: chaptersApartments.map(({ name, rating, reviewCount }) => ({
			apartmentName: name,
			rating,
			reviewCount
		}))
	};
}
