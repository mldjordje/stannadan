import { redirect } from 'next/navigation';
import ApartmentsAdminView from './view';
import { getAdminContext, scopeStayData } from '@/lib/auth/requireAdmin';
import { readStayData } from '@/lib/stay/store';

export default async function AdminApartmentsPage() {
	const context = await getAdminContext();

	if (!context) {
		redirect('/sign-in');
	}

	const data = scopeStayData(await readStayData(), context);

	return <ApartmentsAdminView initialApartments={data.apartments} />;
}
