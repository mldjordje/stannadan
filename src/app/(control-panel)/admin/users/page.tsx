import { redirect } from 'next/navigation';
import { ADMIN_EMAILS } from '@auth/access';
import { getAdminContext } from '@/lib/auth/requireAdmin';
import { readStayData } from '@/lib/stay/store';
import UsersAdminView from './view';

export default async function AdminUsersPage() {
	const context = await getAdminContext();

	if (!context) {
		redirect('/sign-in');
	}

	if (context.role !== 'admin') {
		redirect('/admin');
	}

	const data = await readStayData();

	return (
		<UsersAdminView
			currentEmail={context.email}
			initialApartments={data.apartments}
			initialUsers={data.users}
			superAdminEmails={[...ADMIN_EMAILS]}
		/>
	);
}
