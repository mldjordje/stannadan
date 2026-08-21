'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsIcon from '@mui/icons-material/InsightsOutlined';
import ApartmentIcon from '@mui/icons-material/ApartmentOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/SpaceDashboardOutlined';
import GuestsIcon from '@mui/icons-material/GroupsOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
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
	{ href: '/admin/apartments', label: 'Apartmani i cene', Icon: ApartmentIcon },
	{ href: '/admin/guests', label: 'Gosti', Icon: GuestsIcon },
	{ href: '/admin/analytics', label: 'Analitika', Icon: AnalyticsIcon },
	{ href: '/admin/channel-sync', label: 'Booking sync', Icon: SyncIcon, adminOnly: true },
	{ href: '/admin/users', label: 'Korisnici i vlasnici', Icon: PeopleIcon, adminOnly: true }
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: user, signOut } = useUser();
	const [pendingCount, setPendingCount] = useState(0);
	const [menuOpen, setMenuOpen] = useState(false);
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

	// Navigating always closes the mobile menu.
	useEffect(() => {
		setMenuOpen(false);
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

	const navigation = (
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
	);

	const account = (
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
	);

	return (
		<div className={styles.shell}>
			<header className={styles.mobileHeader}>
				<button
					type="button"
					className={styles.menuButton}
					onClick={() => setMenuOpen(true)}
					aria-label="Otvori meni"
					aria-expanded={menuOpen}
				>
					<MenuIcon />
					{pendingCount > 0 ? <i className={styles.dot} /> : null}
				</button>
				<Link
					href="/admin"
					className={styles.wordmark}
				>
					Stan na dan
				</Link>
				<button
					type="button"
					className={styles.menuButton}
					onClick={openPalette}
					aria-label="Pretraga"
				>
					<SearchIcon />
				</button>
			</header>

			{/* Mobile drawer holds the full menu, so every page is reachable on a phone. */}
			<div
				className={styles.scrim}
				style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none' }}
				onClick={() => setMenuOpen(false)}
				aria-hidden="true"
			/>
			<aside
				className={styles.mobileMenu}
				style={{ transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
				aria-hidden={!menuOpen}
			>
				<div className={styles.mobileMenuHead}>
					<div>
						<span className={styles.wordmark}>Stan na dan</span>
						<p className={styles.caption}>Upravljanje smestajem</p>
					</div>
					<button
						type="button"
						className={styles.menuButton}
						onClick={() => setMenuOpen(false)}
						aria-label="Zatvori meni"
					>
						<CloseIcon />
					</button>
				</div>
				{navigation}
				{account}
			</aside>

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
				{navigation}
				{account}
			</aside>

			<main
				className={styles.content}
				id="main-content"
			>
				{children}
			</main>

			<CommandPalette />
		</div>
	);
}
