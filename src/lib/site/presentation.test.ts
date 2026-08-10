import { expect, test } from 'vitest';

import { defaultStayData } from '../stay/defaultData';
import { buildLandingPresentation } from './presentation';

const cloneDefaultData = () => structuredClone(defaultStayData);

test('keeps featured apartments in their stored order', () => {
	const presentation = buildLandingPresentation(cloneDefaultData());

	expect(presentation.chapters.map((chapter) => chapter.slug)).toEqual(['fortress-loft', 'riverside-suite']);
});

test('uses every stored apartment when none are featured', () => {
	const data = cloneDefaultData();
	data.apartments.forEach((apartment) => {
		apartment.featured = false;
	});

	expect(buildLandingPresentation(data).chapters.map((chapter) => chapter.slug)).toEqual(
		data.apartments.map((apartment) => apartment.slug)
	);
});

test('derives every chapter fact from its apartment and uses optimized chapter art', () => {
	const data = cloneDefaultData();
	const apartment = data.apartments[0];
	const chapter = buildLandingPresentation(data).chapters[0];

	expect(chapter).toMatchObject({
		id: apartment.id,
		slug: apartment.slug,
		name: apartment.name,
		location: apartment.locationNote,
		pricePerNight: apartment.pricePerNight,
		guests: apartment.guests,
		size: apartment.size,
		rating: apartment.rating,
		reviewCount: apartment.reviewCount,
		gallery: apartment.gallery
	});
	expect(chapter.mobileImage).toMatch(/^\/site-assets\/images\/cinematic\//);
	expect(chapter.desktopImage).toMatch(/^\/site-assets\/images\/cinematic\//);
});

test('keeps public copy free of internal terms', () => {
	const serialized = JSON.stringify(buildLandingPresentation(cloneDefaultData())).toLowerCase();

	for (const term of [
		'next.js',
		'google prijava',
		'admin',
		'booking.com sync',
		'kanal menadžment',
		'channel management'
	]) {
		expect(serialized).not.toContain(term);
	}
});

test('derives trust strictly from stored apartment ratings without quotations', () => {
	const data = cloneDefaultData();
	const presentation = buildLandingPresentation(data);

	expect(presentation.trust).toEqual(
		data.apartments
			.filter((apartment) => apartment.featured)
			.map(({ name, rating, reviewCount }) => ({ apartmentName: name, rating, reviewCount }))
	);
	expect(presentation.trust.every((entry) => !('quote' in entry))).toBe(true);
});

test('does not mutate the supplied stay data', () => {
	const data = cloneDefaultData();
	const before = structuredClone(data);

	buildLandingPresentation(data);

	expect(data).toEqual(before);
});
