'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { PropertyProfile, UserRole } from '@/lib/stay/types';

type SiteHeaderProps = {
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

function SiteHeader({ property, userName, roles = [] }: SiteHeaderProps) {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	const isAdmin = roles.includes('admin');
	const primaryHref = userName ? (isAdmin ? '/admin' : '/account') : '/sign-in';
	const primaryLabel = userName ? (isAdmin ? 'Admin' : 'Nalog') : 'Prijava';

	useEffect(() => {
		function onScroll() {
			setScrolled(window.scrollY > 40);
		}

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		setMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';

		return () => {
			document.body.style.overflow = '';
		};
	}, [menuOpen]);

	return (
		<>
			<header className={`snd-nav${scrolled ? ' is-scrolled' : ''}`}>
				<Link
					href="/"
					className="snd-brand"
					aria-label={property.name}
				>
					<span className="snd-monogram">S&#183;D</span>
					<span className="snd-wordmark">
						Stan<span className="dot"> &#183; </span>na<span className="dot"> &#183; </span>Dan
					</span>
				</Link>

				<nav className="snd-menu">
					{navigationItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={pathname === item.href ? 'is-active' : undefined}
						>
							{item.label}
						</Link>
					))}
				</nav>

				<div className="snd-nav-right">
					{userName ? (
						<span className="snd-nav-user">
							<b>{userName.split(' ')[0]}</b>
						</span>
					) : null}
					<Link
						href={primaryHref}
						className="snd-btn"
					>
						<span>{primaryLabel}</span>
						<span className="snd-arr" />
					</Link>
					<button
						type="button"
						className={`snd-burger${menuOpen ? ' is-open' : ''}`}
						onClick={() => setMenuOpen((open) => !open)}
						aria-label="Meni"
						aria-expanded={menuOpen}
					>
						<span />
						<span />
						<span />
					</button>
				</div>
			</header>

			<AnimatePresence>
				{menuOpen ? (
					<motion.div
						className="snd-drawer"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
					>
						{navigationItems.map((item, index) => (
							<motion.div
								key={item.href}
								initial={{ opacity: 0, y: 18 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.06 * index + 0.05, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
							>
								<Link href={item.href}>
									{item.label}
									<span className="idx">{String(index + 1).padStart(2, '0')}</span>
								</Link>
							</motion.div>
						))}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap' }}
						>
							<Link
								href={primaryHref}
								className="snd-btn"
							>
								<span>{primaryLabel}</span>
								<span className="snd-arr" />
							</Link>
							<a
								href={`tel:${property.phone}`}
								className="snd-btn"
							>
								<span>{property.phone}</span>
							</a>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}

export default SiteHeader;
