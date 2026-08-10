import { ApartmentChapters } from '@/components/site/cinematic/ApartmentChapters';
import { BookingPortal } from '@/components/site/cinematic/BookingPortal';
import { HeroSequence } from '@/components/site/cinematic/HeroSequence';
import { LocationStory } from '@/components/site/cinematic/LocationStory';
import { MaterialDetails } from '@/components/site/cinematic/MaterialDetails';
import { ReviewSequence } from '@/components/site/cinematic/ReviewSequence';
import { ScrollProgress } from '@/components/site/cinematic/ScrollProgress';
import { cinematicMedia } from '@/lib/site/media';
import { buildLandingPresentation } from '@/lib/site/presentation';
import { readStayData } from '@/lib/stay/store';

export default async function HomePage() {
	const data = await readStayData();
	const presentation = buildLandingPresentation(data);
	const locationChapter = presentation.chapters[1] ?? presentation.chapters[0];
	const locationImage = locationChapter
		? {
				mobile: locationChapter.mobileImage,
				desktop: locationChapter.desktopImage,
				alt: `Enterijer apartmana ${locationChapter.name} u gradu ${data.property.city}`
			}
		: {
				mobile: cinematicMedia.hero.mobile,
				desktop: cinematicMedia.hero.desktop,
				alt: cinematicMedia.hero.alt
			};

	return (
		<>
			<HeroSequence
				presentation={presentation}
				country={data.property.country}
			/>
			<ScrollProgress />
			<ApartmentChapters
				chapters={presentation.chapters}
				introduction={presentation.introduction}
			/>
			<MaterialDetails
				facts={presentation.materialFacts}
				chapters={presentation.chapters}
			/>
			<LocationStory
				property={{
					city: data.property.city,
					country: data.property.country,
					address: data.property.address,
					phone: data.property.phone,
					email: data.property.email,
					googleMapsUrl: data.property.googleMapsUrl
				}}
				neighborhood={presentation.neighborhood}
				image={locationImage}
			/>
			<ReviewSequence trust={presentation.trust} />
			<BookingPortal
				apartments={presentation.chapters}
				city={presentation.city}
			/>
		</>
	);
}
