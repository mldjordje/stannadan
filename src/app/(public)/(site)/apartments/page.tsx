import ApartmentCard from '@/components/site/ApartmentCard';
import PageHero from '@/components/site/PageHero';
import { readStayData } from '@/lib/stay/store';

export default async function ApartmentsPage() {
	const data = await readStayData();

	return (
		<>
			<PageHero
				kicker="Kolekcija apartmana"
				title="Izaberi smestaj za city break, posao ili porodicni dolazak u Nis."
				description="Svaki apartman ima sopstveni kalendar, direktan booking upit i pripremljen Booking.com export link."
			/>
			<section className="tw-pb-18">
				<div className="container">
					<div className="row g-4">
						{data.apartments.map((apartment) => (
							<div key={apartment.id} className="col-lg-6">
								<ApartmentCard apartment={apartment} />
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
