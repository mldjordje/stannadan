import Image from 'next/image';
import Link from 'next/link';
import ApartmentRow from '@/components/site/ApartmentRow';
import BookingPill from '@/components/site/BookingPill';
import CinemaScene from '@/components/site/CinemaScene';
import GalleryScene from '@/components/site/GalleryScene';
import HeroScene from '@/components/site/HeroScene';
import { AmenityIcon, IconStar } from '@/components/site/Icons';
import Reveal from '@/components/site/Reveal';
import SceneHead from '@/components/site/SceneHead';
import StayCalendar from '@/components/site/StayCalendar';
import Ticker from '@/components/site/Ticker';
import { getBlockedDays } from '@/lib/stay/availability';
import { formatCurrency } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

const PLATES = [
	{ src: '/site-assets/images/custom/hero-main.jpeg', label: 'Posle ponoći', position: '50% 40%' },
	{ src: '/site-assets/images/custom/living-room.jpeg', label: 'Jutarnja fotelja', position: '60% 50%' },
	{ src: '/site-assets/images/custom/kitchen-tv.jpeg', label: 'Kuhinja u 21h', position: '30% 50%' },
	{ src: '/site-assets/images/custom/studio-vertical.jpeg', label: 'Ceo studio', position: '50% 60%' }
];

const AMENITY_COPY: Record<string, string> = {
	'Self check-in': 'Šifra za ulaz stiže dan pre dolaska. Bez čekanja, bez predaje ključa.',
	'Fast Wi-Fi': 'Optika koja izdrži poziv, stream i posao u isto vreme.',
	Parking: 'Mesto ispod zgrade, rezervisano na tvoje ime.',
	'Air conditioning': 'Inverter klima u svakoj sobi, tiha i noću.',
	Kitchen: 'Puna kuhinja: ploča, rerna, aparat za kafu, sudovi za četvoro.',
	Washer: 'Mašina za veš za boravke duže od tri noći.',
	Workspace: 'Radni sto uz prozor, stolica za ceo radni dan.',
	'Smart TV': 'Smart TV sa Netflixom i kanalima uživo.',
	Balcony: 'Balkon sa pogledom na grad i sto za dvoje.',
	'Breakfast option': 'Doručak na zahtev, iz pekare u istoj ulici.',
	'Pet friendly': 'Ljubimci dobrodošli uz najavu.'
};

const REVIEWS = [
	{
		name: 'Mina P.',
		meta: 'Direktna rezervacija · 3 noći',
		text: 'Fotografije ne odaju koliko je tiho. Ušli smo u ponoć bez ijedne poruke unapred, sve je radilo iz prve.'
	},
	{
		name: 'Luca M.',
		meta: 'Booking.com · 4 noći',
		text: 'Parking ispod zgrade i tvrđava na deset minuta hoda. Za posao u Nišu nemam bolji standard.'
	},
	{
		name: 'Nikola J.',
		meta: 'Direktna rezervacija · 4 noći',
		text: 'Porodica od četvoro, ništa nam nije falilo. Domaćin odgovara u minutu, a račun je bio tačno kako piše.'
	}
];

export default async function HomePage() {
	const data = await readStayData();
	const { property, apartments } = data;
	const featured = apartments.filter((apartment) => apartment.featured);
	const cheapest = apartments.reduce((low, apartment) => (apartment.pricePerNight < low.pricePerNight ? apartment : low));
	const averageRating = apartments.reduce((sum, apartment) => sum + apartment.rating, 0) / apartments.length;
	const totalReviews = apartments.reduce((sum, apartment) => sum + apartment.reviewCount, 0);
	const amenities = Array.from(new Set(apartments.flatMap((apartment) => apartment.amenities))).slice(0, 8);
	const blocked = getBlockedDays(data, cheapest.id);

	return (
		<>
			<HeroScene
				image={property.heroImage}
				word="Niš"
				accentIndex={1}
				eyebrow="Stan na dan · noćenje u centru"
				address={property.address}
				tagline={
					<>
						Tri apartmana u centru, jedan kalendar i <em>ključ koji te čeka</em> — bez recepcije i bez
						provizije.
					</>
				}
				stats={[
					{ label: 'Od', value: formatCurrency(cheapest.pricePerNight), suffix: '/ noć' },
					{ label: 'Ocena', value: averageRating.toFixed(2), suffix: `/ ${totalReviews}` },
					{ label: 'Check-in', value: 'Sam', suffix: '0—24h' }
				]}
				primary={{ href: '/apartments', label: 'Pogledaj apartmane' }}
				secondary={{ href: '/availability', label: 'Slobodni termini' }}
			/>

			<Ticker items={['Samostalni check-in', 'Centar Niša', 'Parking', 'Optički internet', 'Bez provizije', 'Klima']} />

			{/* 01 — the space */}
			<section className="snd-section">
				<div className="snd-wrap">
					<SceneHead
						num="01"
						kicker="Prostor"
						title={
							<>
								Stan koji je <em>uređen</em>, a ne opremljen.
							</>
						}
					/>

					<div className="snd-split">
						<Reveal>
							<div
								className="snd-frame is-hoverable"
								style={{ aspectRatio: '4 / 5' }}
							>
								<Image
									src="/site-assets/images/custom/living-room.jpeg"
									alt="Dnevni boravak sa foteljom uz prozor"
									fill
									sizes="(max-width: 1180px) 100vw, 50vw"
									style={{ objectFit: 'cover', objectPosition: '55% 50%' }}
								/>
								<span className="snd-badge">
									<span className="k">U centru od</span>
									<span className="v">2019.</span>
								</span>
							</div>
						</Reveal>

						<Reveal
							className="snd-copy"
							delay={1}
						>
							<p className="is-drop">
								Sve što vidiš na slikama je isto što zatekneš na vratima. Ista fotelja, isti pod, isto
								svetlo u devet uveče. Ne izdajemo sobu — izdajemo stan u kome se odmah zna gde se sedi,
								gde se radi i gde se spava.
							</p>
							<p>
								Parket, topla rasveta i pregrada od letvica koja deli spavaći deo od dnevnog. Kuhinja je
								puna, ne dekorativna. Voda, kafa i uputstva čekaju na stolu.
							</p>
							<div className="snd-signature">
								<span className="line" />
								<span>
									<span className="name">Domaćin</span>
									<span
										className="snd-mono"
										style={{ display: 'block', marginTop: 4 }}
									>
										{property.city} · {property.country}
									</span>
								</span>
							</div>
							<div className="snd-chips">
								{property.neighborhood.map((spot) => (
									<span
										key={spot.label}
										className="snd-chip"
									>
										{spot.label} · {spot.distance}
									</span>
								))}
							</div>
						</Reveal>
					</div>
				</div>
			</section>

			{/* amenities */}
			<section className="snd-section-tight">
				<div className="snd-wrap">
					<Reveal>
						<div className="snd-cells">
							{amenities.map((amenity, index) => (
								<div
									key={amenity}
									className="snd-cell"
								>
									<span className="num">{String(index + 1).padStart(2, '0')}</span>
									<span className="ico">
										<AmenityIcon name={amenity} />
									</span>
									<h4>{amenity}</h4>
									<p>{AMENITY_COPY[amenity] ?? 'Uključeno u svaku rezervaciju.'}</p>
								</div>
							))}
						</div>
					</Reveal>
				</div>
			</section>

			{/* 02 — pinned cinema */}
			<CinemaScene
				image="/site-assets/images/custom/kitchen-tv.jpeg"
				objectPosition="45% 55%"
				length={3}
				slides={[
					{
						kicker: '02 — Veče',
						title: (
							<>
								U devet je <em>utakmica</em>, u deset je tišina.
							</>
						),
						body: 'Veliki ekran, zvuk koji ne prolazi kroz zid i kuhinja na tri koraka. Isti prostor radi i kao dnevna soba i kao kancelarija.'
					},
					{
						kicker: '03 — Kuhinja',
						title: (
							<>
								Kuvaj kao <em>kod kuće</em>, ne kao u hotelu.
							</>
						),
						body: 'Indukciona ploča, rerna, mašina za sudove i aparat za kafu. Prodavnica je u prizemlju, pijaca sedam minuta peške.'
					},
					{
						kicker: '04 — Noć',
						title: (
							<>
								Zamračenje, klima, <em>i onda ništa</em>.
							</>
						),
						body: 'Debele zavese, tiha inverter klima i dušek koji su gosti pomenuli u više od stotinu recenzija.'
					}
				]}
			/>

			{/* 05 — apartments */}
			<section className="snd-section">
				<div className="snd-wrap">
					<SceneHead
						num="05"
						kicker="Kolekcija"
						title={
							<>
								Tri adrese, <em>jedan standard</em>.
							</>
						}
						sub="Svaki apartman ima svoj kalendar. Direktne rezervacije i Booking.com dele isti raspored, pa termin koji vidiš je termin koji dobijaš."
					/>

					<div className="snd-rows">
						{apartments.map((apartment, index) => (
							<ApartmentRow
								key={apartment.id}
								apartment={apartment}
								index={index}
							/>
						))}
					</div>
				</div>
			</section>

			{/* 06 — gallery */}
			<section className="snd-section-tight">
				<div className="snd-wrap">
					<SceneHead
						num="06"
						kicker="Galerija"
						title={
							<>
								Četiri kadra, <em>bez retuširanja</em>.
							</>
						}
					/>
					<GalleryScene plates={PLATES} />
					<Reveal>
						<div
							className="snd-flex-between"
							style={{ marginTop: 44, alignItems: 'center' }}
						>
							<span className="snd-it" style={{ fontSize: 21, color: 'var(--muted)' }}>
								Klikni na bilo koji kadar za pun prikaz.
							</span>
							<Link
								href="/apartments"
								className="snd-tlink"
							>
								<span>Svi apartmani</span>
								<span className="snd-arr" />
							</Link>
						</div>
					</Reveal>
				</div>
			</section>

			{/* 07 — why Niš (light break) */}
			<section className="snd-light">
				<div className="snd-wrap">
					<SceneHead
						num="07"
						kicker="Lokacija"
						title={
							<>
								Zašto baš <em>centar</em>.
							</>
						}
					/>
					<div className="snd-two">
						<Reveal className="snd-copy">
							<p className="is-drop">
								Niš se hoda. Iz ulice u kojoj je stan izlaziš na korzo za četiri minuta, na tvrđavu za
								sedam, a do aerodroma stižeš pre nego što se kafa ohladi.
							</p>
							<p>
								Kazandžijsko sokače, kej i pijaca su u istom krugu. Auto ti treba samo ako ideš do
								Sićevačke klisure — a i tad ima gde da ga ostaviš.
							</p>
						</Reveal>

						<Reveal delay={1}>
							<div className="snd-list">
								{property.neighborhood.map((spot, index) => (
									<div
										key={spot.label}
										className="snd-list-item"
									>
										<span className="num">{String(index + 1).padStart(2, '0')}</span>
										<span className="name">{spot.label}</span>
										<span className="dur">{spot.distance}</span>
									</div>
								))}
								<div className="snd-list-item">
									<span className="num">04</span>
									<span className="name">Korzo i glavni trg</span>
									<span className="dur">4 min peške</span>
								</div>
							</div>
							<div style={{ marginTop: 34 }}>
								<a
									href={property.googleMapsUrl}
									target="_blank"
									rel="noreferrer"
									className="snd-btn snd-btn-ink"
								>
									<span>Otvori na mapi</span>
									<span className="snd-arr" />
								</a>
							</div>
						</Reveal>
					</div>
				</div>
			</section>

			{/* 08 — booking */}
			<section
				className="snd-section"
				id="rezervacija"
				style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line-soft)' }}
			>
				<div className="snd-wrap">
					<SceneHead
						num="08"
						kicker="Termini"
						title={
							<>
								Proveri datume <em>odmah</em>.
							</>
						}
						sub={`Kalendar prikazuje stvarno stanje za ${cheapest.name}. Zauzeti dani dolaze i sa Booking.com-a.`}
					/>

					<div className="snd-two">
						<Reveal>
							<div className="snd-panel">
								<StayCalendar
									blocked={blocked}
									pricePerNight={cheapest.pricePerNight}
								/>
							</div>
						</Reveal>

						<Reveal
							delay={1}
							className="snd-stack"
						>
							<div className="snd-panel-plain">
								<div className="snd-kv">
									<span className="label">Cena po noćenju</span>
									<span className="val">{formatCurrency(cheapest.pricePerNight)}</span>
								</div>
								<div className="snd-kv">
									<span className="label">Završno čišćenje</span>
									<span className="val">{formatCurrency(cheapest.cleaningFee)}</span>
								</div>
								<div className="snd-kv">
									<span className="label">Minimalni boravak</span>
									<span className="val">1 noć</span>
								</div>
								<div className="snd-kv is-total">
									<span className="label">Provizija</span>
									<span className="val">0</span>
								</div>
							</div>

							<p className="snd-lede">
								Rezervacija ide direktno domaćinu. Bez posrednika, bez skrivenih troškova, potvrda
								stiže na email istog dana.
							</p>

							<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
								<Link
									href={`/apartments/${cheapest.slug}#rezervacija`}
									className="snd-btn"
								>
									<span>Rezerviši {cheapest.name}</span>
									<span className="snd-arr" />
								</Link>
								<a
									href={`tel:${property.phone}`}
									className="snd-tlink"
									style={{ alignSelf: 'center' }}
								>
									<span>{property.phone}</span>
								</a>
							</div>
						</Reveal>
					</div>
				</div>
			</section>

			{/* 09 — guestbook */}
			<section className="snd-section">
				<div className="snd-wrap">
					<SceneHead
						num="09"
						kicker="Knjiga gostiju"
						title={
							<>
								Šta gosti <em>zapravo</em> pišu.
							</>
						}
					/>

					<div className="snd-quotes">
						{REVIEWS.map((review, index) => (
							<Reveal
								key={review.name}
								delay={index}
							>
								<div className="snd-quote">
									<span style={{ display: 'inline-flex', gap: 4, color: 'var(--gold)' }}>
										{Array.from({ length: 5 }).map((_, star) => (
											<IconStar
												key={star}
												size={12}
											/>
										))}
									</span>
									<p>{review.text}</p>
									<span className="who">
										<span className="snd-avatar">{review.name.charAt(0)}</span>
										<span>
											<span
												className="snd-it"
												style={{ fontSize: 18, display: 'block' }}
											>
												{review.name}
											</span>
											<span className="snd-mono">{review.meta}</span>
										</span>
									</span>
								</div>
							</Reveal>
						))}
					</div>

					<Reveal>
						<div
							className="snd-flex-between"
							style={{ marginTop: 64, paddingTop: 34, borderTop: '1px solid var(--line-soft)' }}
						>
							<span className="snd-score">
								<span className="big">{averageRating.toFixed(2)}</span>
								<span className="snd-mono">
									prosek · {totalReviews} recenzija · {featured.length} izdvojena apartmana
								</span>
							</span>
							<Link
								href="/contact"
								className="snd-btn"
							>
								<span>Pitaj domaćina</span>
								<span className="snd-arr" />
							</Link>
						</div>
					</Reveal>
				</div>
			</section>

			<BookingPill
				fromPrice={formatCurrency(cheapest.pricePerNight)}
				href={`/apartments/${cheapest.slug}#rezervacija`}
			/>
		</>
	);
}
