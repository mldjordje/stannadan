import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import SceneHead from '@/components/site/SceneHead';
import StayCalendar from '@/components/site/StayCalendar';
import { getBlockedDays, getNextFreeDay } from '@/lib/stay/availability';
import { formatCurrency, formatDate, formatDateRange, sortReservations } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

export default async function AvailabilityPage() {
	const data = await readStayData();
	const reservations = sortReservations(data.reservations);
	const board = data.apartments.map((apartment) => ({
		apartment,
		blocked: getBlockedDays(data, apartment.id),
		upcoming: reservations.filter((reservation) => reservation.apartmentId === apartment.id).slice(0, 3)
	}));
	const soonest = board
		.map((entry) => ({ slug: entry.apartment.slug, free: getNextFreeDay(entry.blocked) }))
		.sort((first, second) => first.free.localeCompare(second.free))[0];

	return (
		<>
			<PageHero
				kicker="Dostupnost"
				crumb="Dostupnost"
				title={
					<>
						Kalendar bez <em>iznenađenja</em>.
					</>
				}
				description="Isti raspored koji domaćin vodi u panelu. Zauzeti dani uključuju i rezervacije koje stižu sa Booking.com-a."
				image="/site-assets/images/custom/studio-vertical.jpeg"
				imagePosition="50% 35%"
				meta={[
					{ label: 'Apartmana', value: String(data.apartments.length) },
					{ label: 'Rezervacija', value: String(data.reservations.length) },
					{ label: 'Prvi slobodan', value: formatDate(soonest.free) }
				]}
			/>

			<section className="snd-section">
				<div className="snd-wrap">
					<SceneHead
						num="01"
						kicker="Po apartmanu"
						title={
							<>
								Izaberi termin, <em>pa pošalji upit</em>.
							</>
						}
						sub="Klikni dolazak i odlazak u kalendaru apartmana koji te zanima — na strani apartmana isti izbor prelazi u formu."
					/>

					<div className="snd-stack" style={{ gap: 70 }}>
						{board.map((entry, index) => (
							<Reveal key={entry.apartment.id}>
								<div
									className="snd-two"
									style={{ gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: 44 }}
								>
									<div className="snd-panel">
										<StayCalendar
											blocked={entry.blocked}
											pricePerNight={entry.apartment.pricePerNight}
										/>
									</div>

									<div className="snd-stack">
										<div>
											<span className="snd-eyebrow">
												{String(index + 1).padStart(2, '0')} — {entry.apartment.locationNote}
											</span>
											<h3
												className="snd-serif"
												style={{ fontSize: 40, marginTop: 10, lineHeight: 1 }}
											>
												{entry.apartment.name}
											</h3>
										</div>

										<div className="snd-panel-plain">
											<div className="snd-kv">
												<span className="label">Cena / noć</span>
												<span className="val">
													{formatCurrency(entry.apartment.pricePerNight)}
												</span>
											</div>
											<div className="snd-kv">
												<span className="label">Prvi slobodan dan</span>
												<span className="val">
													{formatDate(getNextFreeDay(entry.blocked))}
												</span>
											</div>
											<div className="snd-kv">
												<span className="label">Kapacitet</span>
												<span className="val">{entry.apartment.guests} gosta</span>
											</div>
										</div>

										{entry.upcoming.length ? (
											<div className="snd-stack-sm">
												<span className="snd-mono">Naredni zauzeti termini</span>
												{entry.upcoming.map((reservation) => (
													<div
														key={reservation.id}
														className="snd-kv"
														style={{ borderBottom: '1px dashed var(--line-soft)' }}
													>
														<span
															className="snd-serif"
															style={{ fontSize: 18 }}
														>
															{formatDateRange(reservation.checkIn, reservation.checkOut)}
														</span>
														<span
															className={`snd-status is-${
																reservation.status === 'confirmed'
																	? 'confirmed'
																	: 'pending'
															}`}
														>
															{reservation.source}
														</span>
													</div>
												))}
											</div>
										) : (
											<p className="snd-body">Trenutno nema zauzetih termina za ovaj apartman.</p>
										)}

										<Link
											href={`/apartments/${entry.apartment.slug}#rezervacija`}
											className="snd-btn"
											style={{ justifySelf: 'start' }}
										>
											<span>Rezerviši ovaj apartman</span>
											<span className="snd-arr" />
										</Link>
									</div>
								</div>
							</Reveal>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
