import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@auth/authJs';
import PublicInformationLayout from '@/components/site/shared/PublicInformationLayout';
import { formatCurrency, formatDateRange } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';
import type { ReservationStatus } from '@/lib/stay/types';

const reservationStatusLabels: Record<ReservationStatus, string> = {
	pending: 'Čeka potvrdu',
	confirmed: 'Potvrđena',
	'checked-in': 'Boravak u toku',
	'checked-out': 'Boravak završen',
	cancelled: 'Otkazana'
};

export default async function AccountPage() {
	const session = await auth();

	if (!session?.user?.email) {
		redirect('/sign-in');
	}

	const data = await readStayData();
	const reservations = data.reservations.filter((reservation) => reservation.guestEmail === session.user?.email);
	const isAdmin = Array.isArray(session.db?.role) && session.db.role.includes('admin');
	const displayName = session.user.name || 'Gost';

	return (
		<PublicInformationLayout
			intro="Moj nalog"
			heading={`Dobro došli, ${displayName}.`}
			description="Ovde su na jednom mestu rezervacije povezane sa vašom email adresom."
			aside={
				<section aria-labelledby="profile-title">
					<h2
						id="profile-title"
						data-public-section-title
					>
						Profil
					</h2>
					<dl data-public-list>
						<div data-public-row>
							<dt data-public-label>Ime</dt>
							<dd data-public-value>{displayName}</dd>
						</div>
						<div data-public-row>
							<dt data-public-label>Email</dt>
							<dd data-public-value>{session.user.email}</dd>
						</div>
					</dl>
					{isAdmin ? (
						<Link
							href="/admin"
							data-public-link
						>
							Otvori administraciju
						</Link>
					) : null}
				</section>
			}
		>
			<section
				data-public-section
				aria-labelledby="reservations-title"
			>
				<h2
					id="reservations-title"
					data-public-section-title
				>
					Vaše rezervacije
				</h2>

				{reservations.length === 0 ? (
					<>
						<p data-public-empty>Još nema rezervacija povezanih sa ovom email adresom.</p>
						<Link
							href="/apartments"
							data-public-link
						>
							Pogledajte apartmane
						</Link>
					</>
				) : (
					<div>
						{reservations.map((reservation, index) => (
							<article
								key={reservation.id}
								data-public-record
							>
								<header>
									<p data-public-number>{String(index + 1).padStart(2, '0')}</p>
									<p data-public-overline>{reservationStatusLabels[reservation.status]}</p>
									<h3 data-public-title>{reservation.guestName}</h3>
								</header>
								<dl data-public-list>
									<div data-public-row>
										<dt data-public-label>Termin</dt>
										<dd data-public-value>
											{formatDateRange(reservation.checkIn, reservation.checkOut)}
										</dd>
									</div>
									<div data-public-row>
										<dt data-public-label>Status</dt>
										<dd data-public-value>{reservationStatusLabels[reservation.status]}</dd>
									</div>
									<div data-public-row>
										<dt data-public-label>Ukupno</dt>
										<dd data-public-value>{formatCurrency(reservation.totalPrice)}</dd>
									</div>
								</dl>
							</article>
						))}
					</div>
				)}
			</section>
		</PublicInformationLayout>
	);
}
