import Link from 'next/link';
import type { PropertyProfile } from '@/lib/stay/types';
import SiteLogo from '@/components/site/SiteLogo';

type SiteFooterProps = {
	property: PropertyProfile;
};

export default function SiteFooter({ property }: SiteFooterProps) {
	return (
		<footer
			style={{
				background: 'var(--snd-bg)',
				borderTop: '1px solid var(--snd-line-soft)',
				padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 80px) 40px',
				fontFamily: 'var(--snd-serif)',
			}}
		>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
					gap: 'clamp(32px, 4vw, 60px)',
					paddingBottom: 'clamp(40px, 5vw, 60px)',
				}}
				className="snd-footer-grid"
			>
				{/* Brand column */}
				<div style={{ display: 'grid', gap: 24, maxWidth: 360 }}>
					<div>
						<SiteLogo variant="full" scheme="dark" width={220} />
					</div>
					<p
						style={{
							color: 'var(--snd-muted)',
							fontSize: 14,
							lineHeight: 1.7,
							margin: 0,
						}}
					>
						A boutique collection of considered apartments — beginning with Niš, soon
						opening in Belgrade and Novi Sad.
					</p>
					<div style={{ display: 'flex', gap: 12 }}>
						{[
							{ label: 'Instagram', href: '#' },
							{ label: 'WhatsApp', href: `https://wa.me/${property.phone.replace(/\s/g, '')}` },
						].map((s) => (
							<a
								key={s.label}
								href={s.href}
								style={{
									fontFamily: 'var(--snd-mono)',
									fontSize: 9,
									letterSpacing: '0.22em',
									color: 'var(--snd-muted-2)',
									textTransform: 'uppercase',
									textDecoration: 'none',
									padding: '7px 12px',
									border: '1px solid var(--snd-line-soft)',
									borderRadius: 4,
									transition: 'color 0.3s ease, border-color 0.3s ease',
								}}
							>
								{s.label}
							</a>
						))}
					</div>
				</div>

				{/* Apartment */}
				<div>
					<h5
						style={{
							fontFamily: 'var(--snd-mono)',
							fontSize: 10,
							letterSpacing: '0.28em',
							color: 'var(--snd-gold)',
							textTransform: 'uppercase',
							marginBottom: 24,
						}}
					>
						The Apartment
					</h5>
					<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
						{[
							{ href: '#space', label: 'The Space' },
							{ href: '#gallery', label: 'Gallery' },
							{ href: '#booking', label: 'Reserve' },
							{ href: '#guestbook', label: 'Guestbook' },
							{ href: '/apartments', label: 'All Apartments' },
						].map((item) => (
							<li key={item.href}>
								<a
									href={item.href}
									style={{
										fontFamily: 'var(--snd-serif)',
										fontSize: 18,
										color: 'var(--snd-cream-2)',
										textDecoration: 'none',
										transition: 'color 0.3s ease',
									}}
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* Visiting */}
				<div>
					<h5
						style={{
							fontFamily: 'var(--snd-mono)',
							fontSize: 10,
							letterSpacing: '0.28em',
							color: 'var(--snd-gold)',
							textTransform: 'uppercase',
							marginBottom: 24,
						}}
					>
						Visiting
					</h5>
					<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
						{[
							{ href: '#nis', label: 'About Niš' },
							{ href: '/availability', label: 'Availability' },
							{ href: '/contact', label: 'Contact us' },
							{ href: '#', label: 'House manual' },
							{ href: '#', label: 'Press kit' },
						].map((item) => (
							<li key={item.label}>
								<a
									href={item.href}
									style={{
										fontFamily: 'var(--snd-serif)',
										fontSize: 18,
										color: 'var(--snd-cream-2)',
										textDecoration: 'none',
										transition: 'color 0.3s ease',
									}}
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* Contact */}
				<div>
					<h5
						style={{
							fontFamily: 'var(--snd-mono)',
							fontSize: 10,
							letterSpacing: '0.28em',
							color: 'var(--snd-gold)',
							textTransform: 'uppercase',
							marginBottom: 24,
						}}
					>
						Contact
					</h5>
					<ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
						{[
							{ label: property.email, href: `mailto:${property.email}` },
							{ label: property.phone, href: `tel:${property.phone}` },
							{ label: 'Instagram · @stannadan', href: '#' },
							{ label: 'WhatsApp concierge', href: '#' },
						].map((item) => (
							<li key={item.label}>
								<a
									href={item.href}
									style={{
										fontFamily: 'var(--snd-serif)',
										fontSize: 17,
										color: 'var(--snd-cream-2)',
										textDecoration: 'none',
										transition: 'color 0.3s ease',
									}}
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Bottom bar */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					paddingTop: 32,
					borderTop: '1px solid var(--snd-line-soft)',
					flexWrap: 'wrap',
					gap: 12,
				}}
			>
				<span
					style={{
						fontFamily: 'var(--snd-mono)',
						fontSize: 10,
						letterSpacing: '0.24em',
						color: 'var(--snd-muted-2)',
						textTransform: 'uppercase',
					}}
				>
					© 2026 Stan na Dan · Niš
				</span>
				<span
					style={{
						fontFamily: 'var(--snd-serif)',
						fontStyle: 'italic',
						fontSize: 14,
						color: 'var(--snd-muted)',
					}}
				>
					Composed with care by the hosts.
				</span>
				<Link
					href="/sign-in"
					style={{
						fontFamily: 'var(--snd-mono)',
						fontSize: 10,
						letterSpacing: '0.22em',
						color: 'var(--snd-muted-2)',
						textDecoration: 'none',
						textTransform: 'uppercase',
					}}
				>
					Admin sign-in
				</Link>
			</div>

			<style>{`
				@media (max-width: 900px) {
					.snd-footer-grid { grid-template-columns: 1fr 1fr !important; }
				}
				@media (max-width: 560px) {
					.snd-footer-grid { grid-template-columns: 1fr !important; }
				}
			`}</style>
		</footer>
	);
}
