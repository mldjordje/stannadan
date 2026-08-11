import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingPill from '@/components/site/BookingPill';
import BookingRequestForm from '@/components/site/BookingRequestForm';
import CinemaScene from '@/components/site/CinemaScene';
import GalleryScene, { Plate } from '@/components/site/GalleryScene';
import { AmenityIcon, IconStar } from '@/components/site/Icons';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import SceneHead from '@/components/site/SceneHead';
import { getBlockedDays } from '@/lib/stay/availability';
import { formatCurrency } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

type ApartmentDetailsPageProps = {
	params: Promise<{
		slug: string;
	}>;
};

const FALLBACK_IMAGES = [
	'/site-assets/images/custom/hero-main.jpeg',
	'/site-assets/images/custom/living-room.jpeg',
	'/site-assets/images/custom/kitchen-tv.jpeg',
	'/site-assets/images/custom/studio-vertical.jpeg'
];

const PLATE_LABELS = ['Dnevni deo', 'Spavaći deo', 'Kuhinja', 'Pogled'];

export default async function ApartmentDetailsPage({ params }: ApartmentDetailsPageProps) {
	const { slug } = await params;
	const data = await readStayData();
	const apartment = data.apartments.find((item) => item.slug === slug);

	if (!apartment) {
		notFound();
	}

	const blocked = getBlockedDays(data, apartment.id);
	const others = data.apartments.filter((item) => item.id !== apartment.id);
	const sources = Array.from(new Set([...apartment.gallery, apartment.coverImage, ...FALLBACK_IMAGES])).slice(0, 4);
	const plates: Plate[] = sources.map((src, index) => ({
		src,
		label: PLATE_LABELS[index] ?? 'Detalj',
		position: index % 2 === 0 ? '50% 45%' : '55% 55%'
	}));

	return (
		<>
			<PageHero
				kicker={apartment.locationNote}
				crumb={apartment.name}
				title={<>{apartment.name}</>}
				description={apartment.teaser}
				image={apartment.coverImage}
				imagePosition="50% 50%"
				meta={[
					{ label: 'Od', value: formatCurrency(apartment.pricePerNight) },
					{ label: 'Gosti', value: String(apartment.guests) },
					{ label: 'Površina', value: `${apartment.size} m²` }
				]}
			/>

			<section className="snd-section">
				<div className="snd-wrap">
					<div
						className="snd-two"
						style={{ gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' }}
					>
						<div className="snd-stack">
							<Reveal>
								<span className="snd-eyebrow">O prostoru</span>
								<p
									className="snd-lede"
									style={{ marginTop: 18 }}
								>
									{apartment.description}
								</p>
							</Reveal>

							<Reveal delay={1}>
								<div className="snd-specs">
									<div>
										<span className="k">Gosti</span>
										<span className="v">{apartment.guests}</span>
									</div>
									<div>
										<span className="k">Kreveti</span>
										<span className="v">{apartment.beds}</span>
									</div>
									<div>
										<span className="k">Kupatila</span>
										<span className="v">{apartment.baths}</span>
									</div>
									<div>
										<span className="k">Površina</span>
										<span className="v">{apartment.size} m²</span>
									</div>
								</div>
							</Reveal>

							<Reveal delay={2}>
								<h3
									className="snd-serif"
									style={{ fontSize: 28, marginBottom: 18 }}
								>
									Šta je uključeno
								</h3>
								<div className="snd-cells" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
									{apartment.amenities.map((amenity, index) => (
										<div
											key={amenity}
											className="snd-cell"
											style={{ minHeight: 0, padding: '22px 20px 26px' }}
										>
											<span className="num">{String(index + 1).padStart(2, '0')}</span>
											<span
												className="ico"
												style={{ marginBottom: 14 }}
											>
												<AmenityIcon
													name={amenity}
													size={22}
												/>
											</span>
											<h4 style={{ fontSize: 19 }}>{amenity}</h4>
										</div>
									))}
								</div>
							</Reveal>

							<Reveal delay={3}>
								<div className="snd-panel-plain">
									<span className="snd-eyebrow">Kućni red</span>
									<ul style={{ marginTop: 16, display: 'grid', gap: 12 }}>
										{apartment.rules.map((rule) => (
											<li
												key={rule}
												className="snd-serif"
												style={{ fontSize: 19, display: 'flex', gap: 12 }}
											>
												<span className="snd-gold">—</span>
												{rule}
											</li>
										))}
									</ul>
								</div>
							</Reveal>

							<Reveal delay={4}>
								<span className="snd-rating">
									<IconStar
										size={13}
										style={{ color: 'var(--gold)' }}
									/>
									<b>{apartment.rating.toFixed(2)}</b>
									{apartment.reviewCount} verifikovanih recenzija
								</span>
							</Reveal>
						</div>

						<div className="snd-sticky">
							<BookingRequestForm
								apartment={apartment}
								blocked={blocked}
							/>
						</div>
					</div>
				</div>
			</section>

			<CinemaScene
				image={apartment.gallery[1] ?? apartment.coverImage}
				objectPosition="50% 50%"
				length={2}
				slides={[
					{
						kicker: 'Dolazak',
						title: (
							<>
								Ulaziš <em>sam</em>, u bilo koje doba.
							</>
						),
						body: 'Šifra i uputstvo stižu dan ranije. Nema čekanja domaćina, nema predaje ključa, nema depozita na licu mesta.'
					},
					{
						kicker: 'Boravak',
						title: (
							<>
								Sve radi <em>iz prve</em>.
							</>
						),
						body: `${apartment.size} m² spremnih za ${apartment.guests} gosta: klima, optički internet, puna kuhinja i posteljina promenjena istog jutra.`
					}
				]}
			/>

			<section className="snd-section-tight">
				<div className="snd-wrap">
					<SceneHead
						num="—"
						kicker="Galerija"
						title={
							<>
								Kadrovi iz <em>ovog</em> stana.
							</>
						}
					/>
					<GalleryScene plates={plates} />
				</div>
			</section>

			{others.length ? (
				<section className="snd-section-tight">
					<div className="snd-wrap">
						<SceneHead
							num="—"
							kicker="Ostali apartmani"
							title={<>Ako je ovaj zauzet.</>}
						/>
						<div className="snd-cardgrid">
							{others.map((item, index) => (
								<Reveal
									key={item.id}
									delay={index}
								>
									<Link
										href={`/apartments/${item.slug}`}
										className="snd-card"
										style={{ height: '100%' }}
									>
										<span className="snd-eyebrow">{item.locationNote}</span>
										<span className="title">{item.name}</span>
										<span className="snd-mono">
											{item.guests} gosta · {item.size} m² · od {formatCurrency(item.pricePerNight)}
										</span>
										<span className="snd-tlink">
											<span>Otvori</span>
											<span className="snd-arr" />
										</span>
									</Link>
								</Reveal>
							))}
						</div>
					</div>
				</section>
			) : null}

			<BookingPill
				fromPrice={formatCurrency(apartment.pricePerNight)}
				href="#rezervacija"
				label={`${apartment.name} · od`}
			/>
		</>
	);
}
