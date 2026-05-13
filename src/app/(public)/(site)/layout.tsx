import { auth } from '@auth/authJs';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import { readStayData } from '@/lib/stay/store';
import { UserRole } from '@/lib/stay/types';
import './site-globals.css';

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const [session, data] = await Promise.all([auth(), readStayData()]);
	const roles = Array.isArray(session?.db?.role) ? session.db.role : session?.db?.role ? [session.db.role] : [];

	return (
		<div style={{ background: 'var(--snd-bg)', minHeight: '100vh' }}>
			<SiteHeader
				property={data.property}
				userName={session?.db?.displayName || session?.user?.name}
				roles={roles as UserRole[]}
			/>
			<main>{children}</main>
			<SiteFooter property={data.property} />
		</div>
	);
}
