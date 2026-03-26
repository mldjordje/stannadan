import ApartmentsAdminView from './view';
import { readStayData } from '@/lib/stay/store';

export default async function AdminApartmentsPage() {
	const data = await readStayData();

	return <ApartmentsAdminView initialApartments={data.apartments} />;
}
