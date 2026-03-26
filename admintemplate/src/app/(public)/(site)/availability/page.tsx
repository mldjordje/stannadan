import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import { formatDateRange } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

export default async function AvailabilityPage() {
	const data = await readStayData();
	const reservations = [...data.reservations].sort(
		(first, second) => new Date(first.checkIn).getTime() - new Date(second.checkIn).getTime()
	);

	return (
		<>
			<PageHero
				kicker="Dostupnost i prodaja"
				title="Jasan pregled termina za direktne upite i kanal menadzment."
				description="Admin u panelu odrzava isti kalendar koji ovde koristimo za pregled rezervisanih perioda i blokada."
			/>
			<section className="tw-pb-18">
				<div className="container">
					<div className="row g-4">
						{data.apartments.map((apartment) => {
							const apartmentReservations = reservations.filter((reservation) => reservation.apartmentId === apartment.id);
							const nextReservation = apartmentReservations[0];

							return (
								<div key={apartment.id} className="col-lg-4">
									<div className="site-card h-100">
										<p className="text-uppercase tw-text-xs text-main-600 fw-semibold mb-2">{apartment.locationNote}</p>
										<h3 className="tw-text-8 fw-normal text-white tw-mb-4">{apartment.name}</h3>
										<p className="text-white-50 tw-mb-5">
											{nextReservation
												? `Sledeca rezervacija: ${formatDateRange(nextReservation.checkIn, nextReservation.checkOut)}`
												: 'Trenutno nema unetih rezervacija.'}
										</p>
										<ul className="d-flex flex-column tw-gap-3 text-white-50 tw-mb-5">
											{apartmentReservations.slice(0, 3).map((reservation) => (
												<li key={reservation.id} className="d-flex justify-content-between gap-3">
													<span>{reservation.guestName}</span>
													<span>{formatDateRange(reservation.checkIn, reservation.checkOut)}</span>
												</li>
											))}
										</ul>
										<Link href={`/apartments/${apartment.slug}`} className="text-main-600">
											Posalji upit za ovaj apartman
										</Link>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}
