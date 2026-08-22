import { redirect } from 'next/navigation';
import TutorialView from './view';
import { getAdminContext, scopeStayData } from '@/lib/auth/requireAdmin';
import { readStayData } from '@/lib/stay/store';

export default async function AdminTutorialPage() {
	const context = await getAdminContext();

	if (!context) {
		redirect('/sign-in');
	}

	const data = scopeStayData(await readStayData(), context);

	return (
		<TutorialView
			isAdmin={context.role === 'admin'}
			apartments={data.apartments.map(({ id, name }) => ({ id, name }))}
			mappings={data.bookingSync.mappings.map(({ apartmentId, roomName, exportPath, importUrl }) => ({
				apartmentId,
				roomName,
				exportPath,
				hasImportUrl: Boolean(importUrl)
			}))}
		/>
	);
}
