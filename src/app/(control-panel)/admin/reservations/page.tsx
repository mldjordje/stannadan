import ReservationsAdminView from './view';
import { readStayData } from '@/lib/stay/store';

export default async function AdminReservationsPage() {
	const data = await readStayData();

	return <ReservationsAdminView initialApartments={data.apartments} initialReservations={data.reservations} />;
}
