import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@auth/authJs';
import PageHero from '@/components/site/PageHero';
import { formatCurrency, formatDateRange } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

export default async function AccountPage() {
	const session = await auth();

	if (!session?.user?.email) {
		redirect('/sign-in');
	}

	const data = await readStayData();
	const reservations = data.reservations.filter((reservation) => reservation.guestEmail === session.user?.email);
	const isAdmin = Array.isArray(session.db?.role) && session.db.role.includes('admin');

	return (
		<>
			<PageHero
				kicker="Moj nalog"
				title={session.user?.name ? `Dobrodosao, ${session.user.name}` : 'Pregled tvojih rezervacija'}
				description="Google prijava vazi i za goste i za administratore. Ispod je pregled rezervacija povezanih sa tvojim emailom."
			/>
			<section className="tw-pb-18">
				<div className="container">
					<div className="row g-4">
						<div className="col-lg-4">
							<div className="site-surface tw-p-7 h-100">
								<p className="text-uppercase text-main-600 tw-text-sm fw-semibold mb-3">Profil</p>
								<p className="text-white mb-2">{session.user?.name}</p>
								<p className="text-white-50 mb-4">{session.user?.email}</p>
								{isAdmin ? (
									<Link href="/admin" className="text-main-600">
										Otvori admin panel
									</Link>
								) : (
									<p className="text-white-50 mb-0">Ako admin dodeli veca prava, ovde ces videti i precicu ka kontrolnom panelu.</p>
								)}
							</div>
						</div>
						<div className="col-lg-8">
							<div className="site-surface tw-p-7">
								<h3 className="tw-text-8 fw-normal text-white tw-mb-6">Tvoje rezervacije</h3>
								{reservations.length === 0 ? (
									<p className="text-white-50 mb-0">Jos nema rezervacija vezanih za ovaj Google nalog.</p>
								) : (
									<div className="d-flex flex-column tw-gap-4">
										{reservations.map((reservation) => (
											<div key={reservation.id} className="site-mini-card">
												<div className="d-flex justify-content-between gap-3 flex-wrap">
													<div>
														<p className="mb-2 text-white">{reservation.guestName}</p>
														<p className="mb-0 text-white-50">{formatDateRange(reservation.checkIn, reservation.checkOut)}</p>
													</div>
													<div className="text-end">
														<p className="mb-1 text-white">{reservation.status}</p>
														<p className="mb-0 text-white-50">{formatCurrency(reservation.totalPrice)}</p>
													</div>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
