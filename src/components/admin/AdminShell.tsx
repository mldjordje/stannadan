'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useUser from '@auth/useUser';
import styles from './AdminShell.module.css';

const links = [
	{ href: '/admin', label: 'Pregled', mark: '01' },
	{ href: '/admin/apartments', label: 'Apartmani', mark: '02' },
	{ href: '/admin/reservations', label: 'Rezervacije', mark: '03' },
	{ href: '/admin/calendar', label: 'Kalendar', mark: '04' },
	{ href: '/admin/channel-sync', label: 'Booking sync', mark: '05' }
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { signOut } = useUser();

	function isActive(href: string) {
		return href === '/admin' ? pathname === href : pathname.startsWith(href);
	}

	return (
		<div className={styles.shell}>
			<header className={styles.mobileHeader}>
				<Link
					href="/admin"
					className={styles.wordmark}
				>
					Stan na dan
				</Link>
				<Link
					href="/"
					className={styles.siteLink}
				>
					Sajt ↗
				</Link>
			</header>

			<aside className={styles.sidebar}>
				<div>
					<Link
						href="/admin"
						className={styles.wordmark}
					>
						Stan na dan
					</Link>
					<p className={styles.caption}>Upravljanje smeštajem</p>
				</div>
				<nav
					className={styles.navigation}
					aria-label="Admin navigacija"
				>
					{links.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							data-active={isActive(link.href) || undefined}
						>
							<span>{link.mark}</span>
							{link.label}
						</Link>
					))}
				</nav>
				<div className={styles.sidebarFooter}>
					<Link href="/">Otvori javni sajt ↗</Link>
					<button
						type="button"
						onClick={() => void signOut()}
					>
						Odjavi se
					</button>
				</div>
			</aside>

			<main
				className={styles.content}
				id="main-content"
			>
				{children}
			</main>

			<nav
				className={styles.mobileNav}
				aria-label="Mobilna admin navigacija"
			>
				{links.slice(0, 4).map((link) => (
					<Link
						key={link.href}
						href={link.href}
						data-active={isActive(link.href) || undefined}
					>
						<span>{link.mark}</span>
						{link.label}
					</Link>
				))}
			</nav>
		</div>
	);
}
