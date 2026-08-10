import Link from 'next/link';
import PublicInformationLayout from '@/components/site/shared/PublicInformationLayout';
import { formatDateRange } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';
import type { ReservationStatus } from '@/lib/stay/types';

const reservationStatusLabels: Record<Exclude<ReservationStatus, 'cancelled'>, string> = {
	pending: 'Termin čeka potvrdu',
	confirmed: 'Potvrđen termin',
	'checked-in': 'Boravak je u toku',
	'checked-out': 'Boravak je završen'
};

export default async function AvailabilityPage() {
	const data = await readStayData();
	const reservations = data.reservations
		.filter((reservation) => reservation.status !== 'cancelled')
		.sort((first, second) => new Date(first.checkIn).getTime() - new Date(second.checkIn).getTime());

	return (
		<PublicInformationLayout
			intro="Dostupnost"
			heading="Mirniji put do pravog termina."
			description="Prikazani zauzeti periodi služe kao orijentacija. Izaberite apartman i pošaljite upit — domaćin će potvrditi tačnu dostupnost."
		>
			<div data-public-section>
				{data.apartments.map((apartment, index) => {
					const apartmentReservations = reservations.filter(
						(reservation) => reservation.apartmentId === apartment.id
					);
					const nextReservation = apartmentReservations[0];

					return (
						<article
							key={apartment.id}
							data-public-record
						>
							<header>
								<p data-public-number>{String(index + 1).padStart(2, '0')}</p>
								<p data-public-overline>{apartment.locationNote}</p>
								<h2 data-public-title>{apartment.name}</h2>
							</header>

							<div>
								<p data-public-copy>
									{nextReservation
										? `Prvi evidentirani zauzeti period: ${formatDateRange(nextReservation.checkIn, nextReservation.checkOut)}.`
										: 'Za ovaj apartman trenutno nema evidentiranih zauzetih perioda.'}
								</p>

								{apartmentReservations.length > 0 ? (
									<ul
										data-public-list
										aria-label={`Zauzeti periodi za ${apartment.name}`}
									>
										{apartmentReservations.slice(0, 3).map((reservation) => (
											<li
												key={reservation.id}
												data-public-row
											>
												<span data-public-label>Zauzeto</span>
												<p data-public-value>
													{formatDateRange(reservation.checkIn, reservation.checkOut)}
													<span data-public-meta>
														{reservationStatusLabels[reservation.status]}
													</span>
												</p>
											</li>
										))}
									</ul>
								) : null}

								<Link
									href={`/apartments/${apartment.slug}`}
									data-public-link
								>
									Pošaljite upit za apartman
								</Link>
							</div>
						</article>
					);
				})}
			</div>
		</PublicInformationLayout>
	);
}
