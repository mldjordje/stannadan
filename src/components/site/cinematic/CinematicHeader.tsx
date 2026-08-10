'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BookingEntry } from '@/components/site/booking/BookingEntry';
import { PropertyProfile, UserRole } from '@/lib/stay/types';
import styles from './CinematicHeader.module.css';

type CinematicHeaderProps = {
	property: PropertyProfile;
	userName?: string | null;
	roles?: UserRole[];
};

const navigationItems = [
	{ href: '/', label: 'Početna' },
	{ href: '/apartments', label: 'Apartmani' },
	{ href: '/availability', label: 'Dostupnost' },
	{ href: '/contact', label: 'Kontakt' }
];

const focusableSelector = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

function isActiveRoute(pathname: string, href: string) {
	if (href === '/') {
		return pathname === '/';
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}

export function CinematicHeader({ property, userName, roles = [] }: CinematicHeaderProps) {
	const pathname = usePathname();
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [mobileBookingVisible, setMobileBookingVisible] = useState(() => pathname !== '/');
	const triggerRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const wasMenuOpenRef = useRef(false);
	const scrolledRef = useRef(false);
	// prettier-ignore
	const isAdmin=roles.includes('admin');
	// prettier-ignore
	const accountHref=userName?(isAdmin?'/admin':'/account'):'/sign-in';
	const accountLabel = userName ? (isAdmin ? 'Admin' : 'Moj nalog') : 'Prijava';

	const closeMenu = useCallback(() => {
		setMenuOpen(false);
	}, []);

	useEffect(() => {
		const updateScrolledState = () => {
			const nextScrolled = window.scrollY > 72;

			if (nextScrolled !== scrolledRef.current) {
				scrolledRef.current = nextScrolled;
				setScrolled(nextScrolled);
			}
		};

		updateScrolledState();
		window.addEventListener('scroll', updateScrolledState, { passive: true });

		return () => window.removeEventListener('scroll', updateScrolledState);
	}, []);

	useEffect(() => {
		if (pathname !== '/') {
			setMobileBookingVisible(true);
			return;
		}

		const revealMobileBooking = () => setMobileBookingVisible(true);

		window.addEventListener('site:arrival-complete', revealMobileBooking);

		return () => window.removeEventListener('site:arrival-complete', revealMobileBooking);
	}, [pathname]);

	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		if (!menuOpen) {
			if (wasMenuOpenRef.current) {
				triggerRef.current?.focus();
			}

			wasMenuOpenRef.current = false;
			return;
		}

		wasMenuOpenRef.current = true;
		const previousOverflow = document.body.style.overflow;
		const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				closeMenu();
				return;
			}

			if (event.key !== 'Tab' || !dialogRef.current) {
				return;
			}

			const focusableElements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector));
			const firstElement = focusableElements[0];
			const lastElement = focusableElements.at(-1);

			if (!firstElement || !lastElement) {
				event.preventDefault();
				dialogRef.current.focus();
				return;
			}

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		};

		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			window.cancelAnimationFrame(focusFrame);
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [closeMenu, menuOpen]);

	return (
		<header
			className={clsx(styles.header, scrolled && styles.scrolled)}
			data-scrolled={scrolled}
			data-menu-open={menuOpen}
		>
			<div className={styles.bar}>
				<Link
					href="/"
					className={styles.logo}
					aria-label={`${property.name}, početna`}
				>
					<strong className={styles.brand}>Stan na dan</strong>
					<span>{property.city}</span>
				</Link>

				<nav
					className={styles.desktopNav}
					aria-label="Glavna navigacija"
				>
					{navigationItems.map((item) => {
						const active = isActiveRoute(pathname, item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								className={clsx(styles.navLink, active && styles.activeNavLink)}
								aria-current={active ? 'page' : undefined}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className={styles.actions}>
					<BookingEntry
						href="/availability"
						label="Rezerviši"
						variant="edge"
						className={styles.edgeBooking}
					/>
					<button
						ref={triggerRef}
						type="button"
						className={styles.menuTrigger}
						aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'}
						aria-expanded={menuOpen}
						aria-controls="cinematic-menu"
						onClick={() => setMenuOpen((open) => !open)}
					>
						<span aria-hidden="true" />
						<span aria-hidden="true" />
						<span className={styles.menuText}>Meni</span>
					</button>
				</div>
			</div>

			<div
				id="cinematic-menu"
				ref={dialogRef}
				className={styles.menuSheet}
				role="dialog"
				aria-modal="true"
				aria-label="Glavni meni"
				aria-hidden={!menuOpen}
				inert={!menuOpen ? true : undefined}
				tabIndex={-1}
				data-open={menuOpen}
			>
				<div className={styles.sheetTopline}>
					<span>{property.name}</span>
					<button
						ref={closeButtonRef}
						type="button"
						className={styles.closeButton}
						onClick={closeMenu}
						aria-label="Zatvori meni"
					>
						<span aria-hidden="true" />
						<span aria-hidden="true" />
					</button>
				</div>

				<div className={styles.sheetContent}>
					<nav aria-label="Meni destinacija">
						{navigationItems.map((item, index) => {
							const active = isActiveRoute(pathname, item.href);

							return (
								<Link
									key={item.href}
									href={item.href}
									className={styles.sheetLink}
									aria-current={active ? 'page' : undefined}
									onClick={closeMenu}
								>
									<span className={styles.sheetIndex}>{String(index + 1).padStart(2, '0')}</span>
									{item.label}
								</Link>
							);
						})}
					</nav>

					<div className={styles.sheetAside}>
						<BookingEntry
							href="/availability"
							label="Proveri dostupnost"
							variant="menu"
						/>
						<Link
							href={accountHref}
							className={styles.accountLink}
							onClick={closeMenu}
						>
							{accountLabel}
							{userName ? <span>{userName}</span> : null}
						</Link>
					</div>
				</div>
			</div>

			<div
				className={styles.mobileBooking}
				data-visible={mobileBookingVisible}
				aria-hidden={!mobileBookingVisible || menuOpen}
				inert={!mobileBookingVisible || menuOpen ? true : undefined}
			>
				<BookingEntry
					href="/availability"
					label="Proveri dostupnost"
					variant="mobile-bar"
				/>
			</div>
		</header>
	);
}
