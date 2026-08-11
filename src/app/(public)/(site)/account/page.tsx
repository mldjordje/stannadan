import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@auth/authJs';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import SceneHead from '@/components/site/SceneHead';
import { formatCurrency, formatDateRange, getApartmentById, sortReservations } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

const STATUS_LABELS: Record<string, string> = {
	pending: 'Na čekanju',
	confirmed: 'Potvrđeno',
	'checked-in': 'U toku',
	'checked-out': 'Završeno',
	cancelled: 'Otkazano'
};

export default async function AccountPage() {
	const session = await auth();

	if (!session?.user?.email) {
		redirect('/sign-in');
	}

	const data = await readStayData();
	const reservations = sortReservations(
		data.reservations.filter((reservation) => reservation.guestEmail === session.user?.email)
	);
	const isAdmin = Array.isArray(session.db?.role) && session.db.role.includes('admin');
	const nights = reservations.length;

	return (
		<>
			<PageHero
				kicker="Moj nalog"
				crumb="Nalog"
				title={
					session.user?.name ? (
						<>
							Dobro došao, <em>{session.user.name.split(' ')[0]}</em>.
						</>
					) : (
						<>Tvoje rezervacije.</>
					)
				}
				description="Google prijava važi i za goste i za domaćina. Ispod su rezervacije vezane za tvoju adresu."
				image="/site-assets/images/custom/hero-main.jpeg"
				imagePosition="50% 35%"
			/>

			<section className="snd-section">
				<div className="snd-wrap">
					<div
						className="snd-two"
						style={{ gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.2fr)' }}
					>
						<Reveal>
							<div className="snd-panel">
								<span className="snd-eyebrow">Profil</span>
								<p
									className="snd-serif"
									style={{ fontSize: 30, marginTop: 12, lineHeight: 1.15 }}
								>
									{session.user?.name}
								</p>
								<p
									className="snd-mono"
									style={{ marginTop: 8, textTransform: 'none', letterSpacing: '0.08em' }}
								>
									{session.user?.email}
								</p>

								<div
									className="snd-panel-plain"
									style={{ marginTop: 24 }}
								>
									<div className="snd-kv">
										<span className="label">Rezervacija</span>
										<span className="val">{nights}</span>
									</div>
									<div className="snd-kv">
										<span className="label">Status naloga</span>
										<span className="val">{isAdmin ? 'Domaćin' : 'Gost'}</span>
									</div>
								</div>

								<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 24 }}>
									{isAdmin ? (
										<Link
											href="/admin"
											className="snd-btn"
										>
											<span>Admin panel</span>
											<span className="snd-arr" />
										</Link>
									) : null}
									<Link
										href="/apartments"
										className="snd-tlink"
										style={{ alignSelf: 'center' }}
									>
										<span>Nova rezervacija</span>
									</Link>
								</div>
							</div>
						</Reveal>

						<div>
							<SceneHead
								num="—"
								kicker="Istorija"
								title={<>Tvoji termini.</>}
							/>

							{reservations.length === 0 ? (
								<Reveal>
									<div className="snd-panel-plain">
										<p className="snd-lede">Još nema rezervacija vezanih za ovaj nalog.</p>
										<Link
											href="/availability"
											className="snd-tlink"
											style={{ marginTop: 20 }}
										>
											<span>Pogledaj slobodne termine</span>
											<span className="snd-arr" />
										</Link>
									</div>
								</Reveal>
							) : (
								<div className="snd-stack">
									{reservations.map((reservation, index) => {
										const apartment = getApartmentById(data.apartments, reservation.apartmentId);

										return (
											<Reveal
												key={reservation.id}
												delay={index}
											>
												<div className="snd-card">
													<div className="snd-flex-between">
														<div>
															<span className="snd-eyebrow">
																{apartment?.name ?? 'Apartman'}
															</span>
															<p
																className="snd-serif"
																style={{ fontSize: 26, marginTop: 8 }}
															>
																{formatDateRange(
																	reservation.checkIn,
																	reservation.checkOut
																)}
															</p>
														</div>
														<span
															className={`snd-status is-${
																reservation.status === 'confirmed'
																	? 'confirmed'
																	: 'pending'
															}`}
														>
															{STATUS_LABELS[reservation.status] ?? reservation.status}
														</span>
													</div>
													<div className="snd-kv" style={{ marginTop: 8 }}>
														<span className="label">
															{reservation.guests} gosta · {reservation.source}
														</span>
														<span className="val">
															{formatCurrency(reservation.totalPrice)}
														</span>
													</div>
												</div>
											</Reveal>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
