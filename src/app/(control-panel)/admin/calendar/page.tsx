import CalendarAdminView from './view';
import { readStayData } from '@/lib/stay/store';

export default async function AdminCalendarPage() {
	const data = await readStayData();

	return (
		<CalendarAdminView
			initialApartments={data.apartments}
			initialBlocks={data.calendarBlocks}
			initialReservations={data.reservations}
		/>
	);
}
