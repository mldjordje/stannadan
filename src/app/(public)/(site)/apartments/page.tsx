import Link from 'next/link';
import ApartmentRow from '@/components/site/ApartmentRow';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import Ticker from '@/components/site/Ticker';
import { formatCurrency } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

export default async function ApartmentsPage() {
	const data = await readStayData();
	const cheapest = data.apartments.reduce((low, apartment) =>
		apartment.pricePerNight < low.pricePerNight ? apartment : low
	);
	const maxGuests = Math.max(...data.apartments.map((apartment) => apartment.guests));

	return (
		<>
			<PageHero
				kicker="Kolekcija"
				crumb="Apartmani"
				title={
					<>
						Tri stana, <em>isti standard</em>.
					</>
				}
				description="Studio za dvoje, apartman sa balkonom i porodični smeštaj sa parkingom. Svaki sa svojim kalendarom i direktnim upitom."
				image="/site-assets/images/custom/kitchen-tv.jpeg"
				imagePosition="50% 55%"
				meta={[
					{ label: 'Apartmana', value: String(data.apartments.length) },
					{ label: 'Od', value: formatCurrency(cheapest.pricePerNight) },
					{ label: 'Do', value: `${maxGuests} gosta` }
				]}
			/>

			<Ticker items={['Samostalni check-in', 'Bez provizije', 'Centar Niša', 'Parking', 'Klima', 'Optika']} />

			<section className="snd-section">
				<div className="snd-wrap">
					<div className="snd-rows">
						{data.apartments.map((apartment, index) => (
							<ApartmentRow
								key={apartment.id}
								apartment={apartment}
								index={index}
							/>
						))}
					</div>

					<Reveal>
						<div
							className="snd-flex-between"
							style={{ marginTop: 90, paddingTop: 34, borderTop: '1px solid var(--line-soft)' }}
						>
							<p
								className="snd-lede"
								style={{ maxWidth: '40ch' }}
							>
								Ne znaš koji da izabereš? Pošalji termin i broj gostiju — predložićemo stan.
							</p>
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
		</>
	);
}
