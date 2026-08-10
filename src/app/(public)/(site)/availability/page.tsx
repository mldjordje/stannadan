import Link from 'next/link';
import PublicAvailabilityCalendar from '@/components/site/availability/PublicAvailabilityCalendar';
import PublicInformationLayout from '@/components/site/shared/PublicInformationLayout';
import { formatDateRange } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

export default async function AvailabilityPage() {
	const data = await readStayData();
	const reservations = data.reservations
		.filter((reservation) => reservation.status !== 'cancelled')
		.sort((first, second) => first.checkIn.localeCompare(second.checkIn));
	const unavailableRanges = [
		...reservations.map((reservation) => ({
			id: reservation.id,
			apartmentId: reservation.apartmentId,
			start: reservation.checkIn,
			end: reservation.checkOut
		})),
		...data.calendarBlocks.map((block) => ({
			id: block.id,
			apartmentId: block.apartmentId,
			start: block.start,
			end: block.end
		}))
	];

	return (
		<PublicInformationLayout
			intro="Dostupnost"
			heading="Mirniji put do pravog termina."
			description="Izaberite apartman i proverite slobodne dane. Domaćin potvrđuje tačnu dostupnost nakon slanja upita."
		>
			<PublicAvailabilityCalendar
				apartments={data.apartments.map(({ id, name }) => ({ id, name }))}
				unavailableRanges={unavailableRanges}
			/>

			<div data-public-section>
				{data.apartments.map((apartment, index) => {
					const apartmentUnavailable = unavailableRanges
						.filter((range) => range.apartmentId === apartment.id)
						.sort((first, second) => first.start.localeCompare(second.start));
					const nextUnavailable = apartmentUnavailable[0];

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
									{nextUnavailable
										? `Prvi evidentirani zauzeti period: ${formatDateRange(nextUnavailable.start, nextUnavailable.end)}.`
										: 'Za ovaj apartman trenutno nema evidentiranih zauzetih perioda.'}
								</p>

								{apartmentUnavailable.length ? (
									<ul
										data-public-list
										aria-label={`Zauzeti periodi za ${apartment.name}`}
									>
										{apartmentUnavailable.slice(0, 3).map((range) => (
											<li
												key={range.id}
												data-public-row
											>
												<span data-public-label>Zauzeto</span>
												<p data-public-value>{formatDateRange(range.start, range.end)}</p>
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
