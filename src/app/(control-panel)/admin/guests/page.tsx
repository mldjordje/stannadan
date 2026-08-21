import { redirect } from 'next/navigation';
import GuestsAdminView from './view';
import { buildGuestDirectory } from '@/lib/stay/analytics';
import { getAdminContext, scopeStayData } from '@/lib/auth/requireAdmin';
import { readStayData } from '@/lib/stay/store';

export default async function AdminGuestsPage() {
	const context = await getAdminContext();

	if (!context) {
		redirect('/sign-in');
	}

	const data = scopeStayData(await readStayData(), context);

	return (
		<GuestsAdminView
			guests={buildGuestDirectory(data.reservations)}
			apartments={data.apartments.map(({ id, name }) => ({ id, name }))}
		/>
	);
}
