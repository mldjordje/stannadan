import Image from 'next/image';
import { notFound } from 'next/navigation';
import BookingRequestForm from '@/components/site/booking/BookingRequestForm';
import { EditorialGallery } from '@/components/site/cinematic/EditorialGallery';
import { formatCurrency } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';
import type { StayAmenity } from '@/lib/stay/types';
import styles from './page.module.css';

type ApartmentDetailsPageProps = {
	params: Promise<{
		slug: string;
	}>;
	searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
};

const amenityLabels: Record<StayAmenity, string> = {
	'Self check-in': 'Samostalni dolazak',
	'Fast Wi-Fi': 'Brz Wi-Fi',
	Parking: 'Parking',
	'Pet friendly': 'Ljubimci su dobrodošli',
	'Air conditioning': 'Klima-uređaj',
	Kitchen: 'Kuhinja',
	Washer: 'Mašina za veš',
	Workspace: 'Radni kutak',
	'Smart TV': 'Smart TV',
	Balcony: 'Balkon',
	'Breakfast option': 'Doručak po dogovoru'
};

function formatRule(rule: string) {
	return rule.replace('pusenja', 'pušenja').replace('kucni', 'kućni');
}

export default async function ApartmentDetailsPage({ params, searchParams }: ApartmentDetailsPageProps) {
	const { slug } = await params;
	const requestedDates = await searchParams;
	const data = await readStayData();
	const apartment = data.apartments.find((item) => item.slug === slug);

	if (!apartment) {
		notFound();
	}

	const unavailableRanges = [
		...data.reservations
			.filter((reservation) => reservation.apartmentId === apartment.id && reservation.status !== 'cancelled')
			.map((reservation) => ({
				id: reservation.id,
				apartmentId: apartment.id,
				start: reservation.checkIn,
				end: reservation.checkOut
			})),
		...data.calendarBlocks
			.filter((block) => block.apartmentId === apartment.id)
			.map((block) => ({
				id: block.id,
				apartmentId: apartment.id,
				start: block.start,
				end: block.end
			}))
	];

	return (
		<article className={styles.page}>
			<header className={styles.opening}>
				<div className={styles.openingMedia}>
					<Image
						className={styles.openingImage}
						src={apartment.coverImage}
						alt={`${apartment.name} — enterijer apartmana`}
						fill
						priority
						sizes="100vw"
					/>
				</div>

				<div className={styles.openingCopy}>
					<p className={styles.location}>{apartment.locationNote}</p>
					<h1>{apartment.name}</h1>
					<dl className={styles.openingFacts}>
						<div>
							<dt>Noćenje od</dt>
							<dd>{formatCurrency(apartment.pricePerNight)}</dd>
						</div>
						<div>
							<dt>Gosti / kreveti</dt>
							<dd>
								{apartment.guests} / {apartment.beds}
							</dd>
						</div>
						<div>
							<dt>Prostor / kupatila</dt>
							<dd>
								{apartment.size} m² / {apartment.baths}
							</dd>
						</div>
					</dl>
				</div>
			</header>

			<EditorialGallery
				images={apartment.gallery}
				name={apartment.name}
			/>

			<section
				className={styles.story}
				aria-labelledby="story-title"
			>
				<div className={styles.storyInner}>
					<p className={styles.sectionIndex}>01 / Boravak</p>
					<h2 id="story-title">Mesto za vaš ritam Niša.</h2>
					<p className={styles.storyText}>{apartment.description}</p>
				</div>
			</section>

			<section
				className={styles.details}
				aria-labelledby="details-title"
			>
				<div className={styles.detailsInner}>
					<header className={styles.detailsHeader}>
						<p className={styles.sectionIndex}>02 / Važno za boravak</p>
						<h2 id="details-title">Sve što treba, jasno i mirno.</h2>
					</header>

					<div className={styles.lists}>
						<div className={styles.list}>
							<h3>Sadržaji</h3>
							<ul>
								{apartment.amenities.map((item) => (
									<li key={item}>{amenityLabels[item]}</li>
								))}
							</ul>
						</div>

						<div className={styles.list}>
							<h3>Pravila kuće</h3>
							<ul>
								{apartment.rules.map((item) => (
									<li key={item}>{formatRule(item)}</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			<section
				className={styles.proof}
				aria-labelledby="proof-title"
			>
				<div className={styles.proofInner}>
					<p className={styles.sectionIndex}>03 / Utisci gostiju</p>
					<p className={styles.rating}>{apartment.rating.toFixed(2)}</p>
					<h2 id="proof-title">Ocenjeno iz stvarnih boravaka.</h2>
					<p className={styles.reviews}>{apartment.reviewCount} utisaka gostiju / ocena od 5</p>
				</div>
			</section>

			<section
				id="booking"
				className={styles.booking}
				aria-labelledby="booking-title"
			>
				<div className={styles.bookingInner}>
					<header className={styles.bookingIntro}>
						<p className={styles.sectionIndex}>04 / Rezervacija</p>
						<h2 id="booking-title">Pošaljite upit za svoj termin.</h2>
						<p>Unesite datume i kontakt. Odgovor o terminu dobićete direktno od domaćina.</p>
					</header>
					<BookingRequestForm
						apartment={apartment}
						unavailableRanges={unavailableRanges}
						initialCheckIn={requestedDates.checkIn}
						initialCheckOut={requestedDates.checkOut}
					/>
				</div>
			</section>
		</article>
	);
}
