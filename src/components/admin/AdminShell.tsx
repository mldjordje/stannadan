'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsIcon from '@mui/icons-material/InsightsOutlined';
import ApartmentIcon from '@mui/icons-material/ApartmentOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import GuestsIcon from '@mui/icons-material/GroupsOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import SyncIcon from '@mui/icons-material/SyncAltOutlined';
import useUser from '@auth/useUser';
import CommandPalette from './CommandPalette';
import styles from './AdminShell.module.css';

const links = [
	{ href: '/admin', label: 'Pregled', Icon: DashboardIcon },
	{ href: '/admin/calendar', label: 'Kalendar', Icon: CalendarIcon },
	{ href: '/admin/reservations', label: 'Rezervacije', Icon: ReceiptIcon, badge: 'pending' as const },
	{ href: '/admin/guests', label: 'Gosti', Icon: GuestsIcon },
	{ href: '/admin/analytics', label: 'Analitika', Icon: AnalyticsIcon },
	{ href: '/admin/apartments', label: 'Apartmani', Icon: ApartmentIcon },
	{ href: '/admin/channel-sync', label: 'Booking sync', Icon: SyncIcon, adminOnly: true },
	{ href: '/admin/users', label: 'Korisnici', Icon: PeopleIcon, adminOnly: true }
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: user, signOut } = useUser();
	const [pendingCount, setPendingCount] = useState(0);
	const roles = Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [];
	const isAdmin = roles.includes('admin');
	const visibleLinks = links.filter((link) => !link.adminOnly || isAdmin);

	// Small live counter so an operator sees unconfirmed bookings from any screen.
	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const response = await fetch('/api/stay/reservations?status=pending');

				if (!response.ok) {
					return;
				}

				const data = (await response.json()) as unknown[];

				if (!cancelled) {
					setPendingCount(Array.isArray(data) ? data.length : 0);
				}
			} catch {
				// A failed badge refresh must never break the panel.
			}
		}

		load();

		return () => {
			cancelled = true;
		};
	}, [pathname]);

	function openPalette() {
		window.dispatchEvent(new Event('admin:open-command-palette'));
	}

	function isActive(href: string) {
		return href === '/admin' ? pathname === href : pathname.startsWith(href);
	}

	const initials = (user?.displayName || user?.email || '?')
		.split(/[\s@.]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');

	return (
		<div className={styles.shell}>
			<header className={styles.mobileHeader}>
				<Link
					href="/admin"
					className={styles.wordmark}
				>
					Stan na dan
				</Link>
				<div className={styles.headerActions}>
					<button
						type="button"
						className={styles.mobileSearch}
						onClick={openPalette}
						aria-label="Pretraga"
					>
						<SearchIcon fontSize="small" />
					</button>
					<Link
						href="/"
						className={styles.siteLink}
					>
						Sajt ↗
					</Link>
				</div>
			</header>

			<aside className={styles.sidebar}>
				<div>
					<Link
						href="/admin"
						className={styles.wordmark}
					>
						Stan na dan
					</Link>
					<p className={styles.caption}>Upravljanje smestajem</p>
					<button
						type="button"
						className={styles.searchTrigger}
						onClick={openPalette}
					>
						<SearchIcon fontSize="small" />
						<span>Pretraga</span>
						<kbd>Ctrl K</kbd>
					</button>
				</div>

				<nav
					className={styles.navigation}
					aria-label="Admin navigacija"
				>
					{visibleLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							data-active={isActive(link.href) || undefined}
						>
							<link.Icon fontSize="small" />
							<span className={styles.navLabel}>{link.label}</span>
							{link.badge === 'pending' && pendingCount > 0 ? (
								<span className={styles.badge}>{pendingCount}</span>
							) : null}
						</Link>
					))}
				</nav>

				<div className={styles.sidebarFooter}>
					{user?.email ? (
						<div className={styles.profile}>
							<span className={styles.avatar}>{initials}</span>
							<div className={styles.profileText}>
								<strong>{user.displayName || user.email}</strong>
								<span>{isAdmin ? 'Admin' : 'Vlasnik apartmana'}</span>
							</div>
						</div>
					) : null}
					<Link href="/">Otvori javni sajt ↗</Link>
					<button
						type="button"
						onClick={() => void signOut()}
					>
						<LogoutIcon fontSize="small" />
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
				{visibleLinks.slice(0, 4).map((link) => (
					<Link
						key={link.href}
						href={link.href}
						data-active={isActive(link.href) || undefined}
					>
						<span className={styles.mobileIcon}>
							<link.Icon fontSize="small" />
							{link.badge === 'pending' && pendingCount > 0 ? <i className={styles.dot} /> : null}
						</span>
						{link.label}
					</Link>
				))}
			</nav>

			<CommandPalette />
		</div>
	);
}
