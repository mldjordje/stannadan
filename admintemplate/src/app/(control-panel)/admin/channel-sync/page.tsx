import ChannelSyncAdminView from './view';
import { readStayData } from '@/lib/stay/store';

export default async function AdminChannelSyncPage() {
	const data = await readStayData();

	return <ChannelSyncAdminView initialApartments={data.apartments} initialSync={data.bookingSync} />;
}
