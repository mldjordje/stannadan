export type ApartmentChapter = {
	id: string;
	slug: string;
	name: string;
	statement: string;
	location: string;
	pricePerNight: number;
	guests: number;
	size: number;
	rating: number;
	reviewCount: number;
	mobileImage: string;
	desktopImage: string;
	gallery: string[];
};

export type LandingPresentation = {
	city: string;
	propertyName: string;
	arrivalLine: string;
	introduction: string;
	chapters: ApartmentChapter[];
	materialFacts: { value: string; label: string }[];
	neighborhood: { label: string; distance: string }[];
	trust: { rating: number; reviewCount: number; apartmentName: string }[];
};
