'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import type { PropertyProfile, UserRole } from '@/lib/stay/types';
import SiteLogo from '@/components/site/SiteLogo';

type SiteHeaderProps = {
	property: PropertyProfile;
	userName?: string | null;
	roles?: UserRole[];
};

const NAV_ITEMS = [
	{ href: '#space', label: 'The Space' },
	{ href: '#gallery', label: 'Gallery' },
	{ href: '#nis', label: 'Niš' },
	{ href: '#booking', label: 'Reserve' },
	{ href: '#guestbook', label: 'Guestbook' },
];

export default function SiteHeader({ property, userName, roles = [] }: SiteHeaderProps) {
	const [scrolled, setScrolled] = useState(false);
	const isAdmin = roles.includes('admin');
	const primaryHref = userName ? (isAdmin ? '/admin' : '/account') : '/sign-in';
	const primaryLabel = userName ? (isAdmin ? 'Admin panel' : 'My account') : 'Sign in';

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 32);
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<motion.header
			style={{
				position: 'fixed',
				inset: '0 0 auto 0',
				zIndex: 50,
				display: 'grid',
				gridTemplateColumns: '1fr auto 1fr',
				alignItems: 'center',
				padding: scrolled ? '14px 40px' : '20px 40px',
				background: scrolled ? 'rgba(10, 14, 26, 0.80)' : 'transparent',
				backdropFilter: scrolled ? 'blur(14px)' : 'none',
				WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
				borderBottom: scrolled ? '1px solid rgba(244, 239, 230, 0.08)' : '1px solid transparent',
				transition: 'padding 0.3s ease, background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
			}}
		>
			{/* Brand */}
			<Link
				href="/"
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					textDecoration: 'none',
				}}
			>
				<SiteLogo variant="full" scheme="dark" width={190} />
			</Link>

			{/* Center nav */}
			<nav
				style={{
					display: 'flex',
					gap: 36,
				}}
			>
				{NAV_ITEMS.map((item) => (
					<a
						key={item.href}
						href={item.href}
						style={{
							fontFamily: 'var(--snd-mono)',
							fontSize: 10,
							letterSpacing: '0.22em',
							textTransform: 'uppercase',
							color: 'var(--snd-cream-2)',
							textDecoration: 'none',
							position: 'relative',
							padding: '6px 0',
							whiteSpace: 'nowrap',
						}}
						className="snd-nav-link"
						onClick={(e) => {
							const id = item.href.replace('#', '');
							const el = document.getElementById(id);
							if (el) {
								e.preventDefault();
								el.scrollIntoView({ behavior: 'smooth', block: 'start' });
							}
						}}
					>
						{item.label}
					</a>
				))}
			</nav>

			{/* Right CTA */}
			<div
				style={{
					justifySelf: 'end',
					display: 'flex',
					alignItems: 'center',
					gap: 18,
				}}
			>
				{userName && (
					<span
						style={{
							fontFamily: 'var(--snd-mono)',
							fontSize: 10,
							letterSpacing: '0.18em',
							color: 'var(--snd-muted)',
							display: 'none',
						}}
						className="snd-username"
					>
						{userName}
					</span>
				)}
				<Link
					href={primaryHref}
					className="snd-ghost-btn"
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 10,
						padding: '10px 20px',
						border: '1px solid var(--snd-gold)',
						color: 'var(--snd-gold)',
						fontFamily: 'var(--snd-mono)',
						fontSize: 10,
						letterSpacing: '0.24em',
						textTransform: 'uppercase',
						borderRadius: 4,
						textDecoration: 'none',
						whiteSpace: 'nowrap',
					}}
				>
					<span>{primaryLabel}</span>
				</Link>
			</div>

			<style>{`
				@media (max-width: 900px) {
					header nav { display: none !important; }
					header { grid-template-columns: 1fr auto !important; padding-left: 20px !important; padding-right: 20px !important; }
				}
				.snd-nav-link::after {
					content: '';
					position: absolute;
					left: 0; right: 100%;
					bottom: 0; height: 1px;
					background: var(--snd-gold);
					transition: right 0.5s cubic-bezier(.2,.7,.2,1);
				}
				.snd-nav-link:hover::after { right: 0; }
				@media (min-width: 1100px) { .snd-username { display: block !important; } }
			`}</style>
		</motion.header>
	);
}
