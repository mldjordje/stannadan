import { Instrument_Serif } from 'next/font/google';
import { auth } from '@auth/authJs';
import { CinematicHeader } from '@/components/site/cinematic/CinematicHeader';
import { SiteFooter } from '@/components/site/cinematic/SiteFooter';
import { MotionProvider } from '@/components/site/motion/MotionProvider';
import StructuredData from '@/components/site/StructuredData';
import { readStayData } from '@/lib/stay/store';
import { UserRole } from '@/lib/stay/types';
import './site-globals.css';

const instrumentSerif = Instrument_Serif({
	subsets: ['latin'],
	weight: '400',
	variable: '--font-instrument',
	display: 'swap'
});

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const [session, data] = await Promise.all([auth(), readStayData()]);
	const roles = Array.isArray(session?.db?.role) ? session.db.role : session?.db?.role ? [session.db.role] : [];

	return (
		<MotionProvider className={`${instrumentSerif.variable} site-app`}>
			<StructuredData
				property={data.property}
				apartments={data.apartments}
			/>
			<a
				className="site-skip-link"
				href="#main-content"
			>
				Preskoči na sadržaj
			</a>
			<CinematicHeader
				property={data.property}
				userName={session?.db?.displayName || session?.user?.name}
				roles={roles as UserRole[]}
			/>
			<main
				id="main-content"
				tabIndex={-1}
			>
				{children}
			</main>
			<SiteFooter
				property={data.property}
				apartments={data.apartments.map(({ id, slug, name }) => ({
					id,
					slug,
					name
				}))}
			/>
		</MotionProvider>
	);
}
