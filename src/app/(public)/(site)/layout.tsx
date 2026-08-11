import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { auth } from '@auth/authJs';
import Atmosphere from '@/components/site/Atmosphere';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import { readStayData } from '@/lib/stay/store';
import { UserRole } from '@/lib/stay/types';
import './site-globals.css';

const cormorant = Cormorant_Garamond({
	subsets: ['latin', 'latin-ext'],
	weight: ['300', '400', '500'],
	style: ['normal', 'italic'],
	variable: '--font-cormorant',
	display: 'swap'
});

const inter = Inter({
	subsets: ['latin', 'latin-ext'],
	weight: ['300', '400', '500'],
	variable: '--font-inter',
	display: 'swap'
});

const jetbrains = JetBrains_Mono({
	subsets: ['latin', 'latin-ext'],
	weight: ['300', '400'],
	variable: '--font-jetbrains',
	display: 'swap'
});

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const [session, data] = await Promise.all([auth(), readStayData()]);
	const roles = Array.isArray(session?.db?.role) ? session.db.role : session?.db?.role ? [session.db.role] : [];

	return (
		<div className={`${cormorant.variable} ${inter.variable} ${jetbrains.variable} snd-root`}>
			<Atmosphere />
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
