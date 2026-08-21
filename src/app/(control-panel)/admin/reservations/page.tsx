import { redirect } from 'next/navigation';
import ReservationsAdminView from './view';
import { getAdminContext, scopeStayData } from '@/lib/auth/requireAdmin';
import { readStayData } from '@/lib/stay/store';

export default async function AdminReservationsPage() {
	const context = await getAdminContext();

	if (!context) {
		redirect('/sign-in');
	}

	const data = scopeStayData(await readStayData(), context);

	return (
		<ReservationsAdminView
			initialApartments={data.apartments}
			initialReservations={data.reservations}
		/>
	);
}
