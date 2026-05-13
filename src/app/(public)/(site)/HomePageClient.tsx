'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
	motion,
	useScroll,
	useTransform,
	useInView,
	AnimatePresence,
	useMotionValue,
	useSpring,
} from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import type { PropertyProfile, Apartment } from '@/lib/stay/types';

interface HomePageClientProps {
	property: PropertyProfile;
	apartments: Apartment[];
}

// ─── Reusable reveal block ───────────────────────────────────────────────────
function RevealBlock({
	children,
	delay = 0,
	y = 28,
	style,
	className,
}: {
	children: React.ReactNode;
	delay?: number;
	y?: number;
	style?: React.CSSProperties;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-8% 0px' });
	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 1.1, delay, ease: [0.2, 0.7, 0.2, 1] }}
			style={style}
			className={className}
		>
			{children}
		</motion.div>
	);
}

// ─── Section header ──────────────────────────────────────────────────────────
function SectionHead({
	num,
	title,
	subtitle,
	light,
}: {
	num: string;
	title: React.ReactNode;
	subtitle?: string;
	light?: boolean;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-8% 0px' });
	const gold = light ? '#806423' : 'var(--snd-gold)';
	const cream = light ? '#111' : 'var(--snd-cream)';
	const muted = light ? 'rgba(0,0,0,0.55)' : 'var(--snd-muted)';

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 28 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
			style={{
				display: 'grid',
				gridTemplateColumns: 'clamp(120px, 14vw, 200px) 1fr',
				gap: 'clamp(24px, 4vw, 60px)',
				marginBottom: 'clamp(48px, 6vw, 80px)',
				alignItems: 'start',
			}}
		>
			<span
				style={{
					fontFamily: 'var(--snd-mono)',
					fontSize: 11,
					letterSpacing: '0.28em',
					color: gold,
					paddingTop: 18,
					borderTop: `1px solid ${gold}`,
					display: 'block',
				}}
			>
				{num}
			</span>
			<div>
				<h2
					style={{
						fontFamily: 'var(--snd-serif)',
						fontSize: 'clamp(40px, 6vw, 86px)',
						fontWeight: 300,
						lineHeight: 1.0,
						letterSpacing: '-0.025em',
						maxWidth: '14ch',
						color: cream,
						margin: 0,
					}}
				>
					{title}
				</h2>
				{subtitle && (
					<p
						style={{
							fontFamily: 'var(--snd-serif)',
							fontSize: 20,
							color: muted,
							fontWeight: 300,
							lineHeight: 1.45,
							marginTop: 24,
							maxWidth: '48ch',
						}}
					>
						{subtitle}
					</p>
				)}
			</div>
		</motion.div>
	);
}

// ─── Curtain reveal ──────────────────────────────────────────────────────────
function PageCurtain() {
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		const t = setTimeout(() => setVisible(false), 700);
		return () => clearTimeout(t);
	}, []);

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 200,
						pointerEvents: 'none',
						display: 'flex',
						flexDirection: 'column',
					}}
				>
					<motion.div
						exit={{ y: '-100%' }}
						transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
						style={{
							flex: 1,
							background: 'var(--snd-bg)',
							borderBottom: '1px solid var(--snd-gold)',
							display: 'flex',
							alignItems: 'flex-end',
							justifyContent: 'center',
							paddingBottom: 36,
						}}
					>
						<motion.span
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
							style={{
								fontFamily: 'var(--snd-serif)',
								fontStyle: 'italic',
								fontSize: 'clamp(36px, 5vw, 72px)',
								color: 'var(--snd-gold)',
								letterSpacing: '-0.02em',
							}}
						>
							Stan na Dan
						</motion.span>
					</motion.div>
					<motion.div
						exit={{ y: '100%' }}
						transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
						style={{
							flex: 1,
							background: 'var(--snd-bg)',
							borderTop: '1px solid var(--snd-line-soft)',
							display: 'flex',
							alignItems: 'flex-start',
							justifyContent: 'center',
							paddingTop: 36,
						}}
					>
						<motion.span
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
							style={{
								fontFamily: 'var(--snd-mono)',
								fontSize: 10,
								letterSpacing: '0.3em',
								color: 'var(--snd-muted)',
								textTransform: 'uppercase',
							}}
						>
							Niš · Serbia · 43°19′N
						</motion.span>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function HeroSection({ property }: { property: PropertyProfile }) {
	const { scrollY } = useScroll();
	const bgY = useTransform(scrollY, [0, 900], [0, 220]);
	const contentOpacity = useTransform(scrollY, [0, 500], [1, 0]);
	const chars = ['N', 'i', 'š'];

	return (
		<section
			id="top"
			style={{
				position: 'relative',
				minHeight: '100vh',
				display: 'grid',
				gridTemplateRows: '1fr auto',
				overflow: 'hidden',
				background: 'var(--snd-bg)',
			}}
		>
			{/* Parallax background */}
			<motion.div
				style={{
					position: 'absolute',
					inset: '-12% 0',
					y: bgY,
				}}
			>
				<Image
					src="/site-assets/images/custom/studio-wide.jpeg"
					alt="Stan na Dan Niš"
					fill
					priority
					style={{
						objectFit: 'cover',
						objectPosition: '50% 35%',
						filter: 'saturate(0.65) brightness(0.48)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'linear-gradient(180deg, rgba(10,14,26,0.32) 0%, rgba(10,14,26,0.06) 30%, rgba(10,14,26,0.9) 100%)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'linear-gradient(90deg, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.28) 55%, rgba(10,14,26,0.6) 100%)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'radial-gradient(ellipse at 15% 78%, rgba(201,168,76,0.14), transparent 45%)',
						pointerEvents: 'none',
					}}
				/>
			</motion.div>

			{/* Content */}
			<motion.div
				style={{
					position: 'relative',
					zIndex: 2,
					opacity: contentOpacity,
					padding: 'clamp(110px, 14vh, 180px) clamp(20px, 5vw, 80px) 48px',
					display: 'grid',
					alignContent: 'end',
					gap: 32,
				}}
			>
				{/* Meta bar */}
				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.5, duration: 0.8 }}
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingBottom: 18,
						borderBottom: '1px solid var(--snd-line-soft)',
						flexWrap: 'wrap',
						gap: 12,
					}}
				>
					<div style={{ display: 'flex', gap: 48, alignItems: 'center', flexWrap: 'wrap' }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span
								style={{
									width: 7,
									height: 7,
									borderRadius: '50%',
									background: 'var(--snd-gold)',
									boxShadow: '0 0 14px var(--snd-gold)',
									animation: 'snd-pulse 2.4s ease-in-out infinite',
									display: 'inline-block',
								}}
							/>
							<span
								style={{
									fontFamily: 'var(--snd-mono)',
									fontSize: 10,
									letterSpacing: '0.28em',
									textTransform: 'uppercase',
									color: 'var(--snd-gold)',
								}}
							>
								Available · Niš · Serbia
							</span>
						</div>
						<span
							style={{
								fontFamily: 'var(--snd-mono)',
								fontSize: 10,
								letterSpacing: '0.28em',
								textTransform: 'uppercase',
								color: 'var(--snd-muted-2)',
							}}
						>
							Boutique Collection
						</span>
					</div>
					<span
						style={{
							fontFamily: 'var(--snd-mono)',
							fontSize: 10,
							letterSpacing: '0.24em',
							color: 'var(--snd-muted-2)',
						}}
					>
						43°19′N — 21°54′E
					</span>
				</motion.div>

				{/* NIŠ + tagline */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)',
						gap: 40,
						alignItems: 'end',
					}}
				>
					<h1
						aria-label="Niš"
						style={{
							fontFamily: 'var(--snd-serif)',
							fontSize: 'clamp(108px, 19vw, 290px)',
							fontWeight: 300,
							letterSpacing: '-0.04em',
							lineHeight: 0.85,
							margin: '0 0 0 -0.04em',
							overflow: 'hidden',
						}}
					>
						{chars.map((char, i) => (
							<motion.span
								key={i}
								initial={{ y: '110%', opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{
									delay: 1.05 + i * 0.11,
									duration: 1.15,
									ease: [0.2, 0.7, 0.15, 1],
								}}
								style={{
									display: 'inline-block',
									fontStyle: i === 1 ? 'italic' : 'normal',
									color: i === 1 ? 'var(--snd-gold)' : 'var(--snd-cream)',
								}}
							>
								{char}
							</motion.span>
						))}
					</h1>

					<div
						style={{
							paddingBottom: 20,
							display: 'grid',
							gap: 24,
							maxWidth: 440,
							justifySelf: 'end',
						}}
					>
						<motion.p
							initial={{ opacity: 0, y: 18 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1.55, duration: 0.9 }}
							style={{
								fontFamily: 'var(--snd-serif)',
								fontSize: 'clamp(19px, 1.7vw, 25px)',
								lineHeight: 1.38,
								fontWeight: 300,
								color: 'var(--snd-cream)',
								margin: 0,
							}}
						>
							A luminous collection of studios above the city —
							<em style={{ color: 'var(--snd-gold)', fontWeight: 400 }}>
								{' '}
								composed for the discerning traveler,
							</em>{' '}
							one night at a time.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1.75, duration: 0.8 }}
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(3,1fr)',
								gap: 20,
								paddingTop: 22,
								borderTop: '1px solid var(--snd-line-soft)',
							}}
						>
							{[
								{ k: 'From', v: '€54', s: '/ night' },
								{ k: 'Rating', v: '4.95', s: '★' },
								{ k: 'Center', v: '300m', s: 'walk' },
							].map(({ k, v, s }) => (
								<div key={k}>
									<span
										style={{
											display: 'block',
											fontFamily: 'var(--snd-mono)',
											fontSize: 9,
											letterSpacing: '0.22em',
											textTransform: 'uppercase',
											color: 'var(--snd-muted-2)',
											marginBottom: 7,
										}}
									>
										{k}
									</span>
									<span
										style={{
											fontFamily: 'var(--snd-serif)',
											fontSize: 22,
											fontWeight: 400,
											lineHeight: 1,
											color: 'var(--snd-cream)',
										}}
									>
										{v}
										<small
											style={{
												fontFamily: 'var(--snd-mono)',
												fontSize: 10,
												color: 'var(--snd-muted)',
												letterSpacing: '0.06em',
												marginLeft: 4,
											}}
										>
											{s}
										</small>
									</span>
								</div>
							))}
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 2.0, duration: 0.8 }}
						>
							<Link
								href="/apartments"
								className="snd-ghost-btn"
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 14,
									padding: '13px 26px',
									border: '1px solid var(--snd-gold)',
									color: 'var(--snd-gold)',
									fontFamily: 'var(--snd-mono)',
									fontSize: 11,
									letterSpacing: '0.24em',
									textTransform: 'uppercase',
									borderRadius: 4,
									textDecoration: 'none',
								}}
							>
								<span>Reserve a Night</span>
								<span
									style={{
										width: 18,
										height: 1,
										background: 'currentColor',
										position: 'relative',
										display: 'inline-block',
										flexShrink: 0,
									}}
								>
									<span
										style={{
											position: 'absolute',
											right: -1,
											top: -3,
											width: 7,
											height: 7,
											borderRight: '1px solid currentColor',
											borderTop: '1px solid currentColor',
											transform: 'rotate(45deg)',
											display: 'block',
										}}
									/>
								</span>
							</Link>
						</motion.div>
					</div>
				</div>
			</motion.div>

			{/* Bottom bar */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.9, duration: 1.0 }}
				style={{
					position: 'relative',
					zIndex: 2,
					padding: '22px clamp(20px, 5vw, 80px) 30px',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
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
						color: 'var(--snd-muted)',
					}}
				>
					{property.address}
				</span>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						fontFamily: 'var(--snd-mono)',
						fontSize: 10,
						letterSpacing: '0.28em',
						color: 'var(--snd-cream-2)',
						textTransform: 'uppercase',
					}}
				>
					<span>Scroll to enter</span>
					<span
						style={{
							width: 60,
							height: 1,
							background: 'var(--snd-gold)',
							position: 'relative',
							overflow: 'hidden',
							display: 'inline-block',
						}}
					>
						<span
							style={{
								position: 'absolute',
								inset: 0,
								background:
									'linear-gradient(90deg, transparent, var(--snd-cream), transparent)',
								animation: 'snd-slide-line 2.4s ease-in-out infinite',
							}}
						/>
					</span>
				</div>
				<span
					style={{
						fontFamily: 'var(--snd-mono)',
						fontSize: 10,
						letterSpacing: '0.24em',
						color: 'var(--snd-muted)',
					}}
				>
					EST. 2024 · Edition I
				</span>
			</motion.div>
		</section>
	);
}

// ─── Ticker marquee ──────────────────────────────────────────────────────────
function TickerSection() {
	const items = [
		'Late check-in',
		'Egyptian cotton',
		'Concierge by message',
		'Espresso bar',
		'5 min to Tvrđava',
		'Smart climate',
		'Silent washer',
		'100Mbps fibre',
		'Self check-in',
		'Rainfall shower',
		'City views',
		'Direct booking',
	];
	const full = [...items, ...items];

	return (
		<div
			style={{
				borderTop: '1px solid var(--snd-line-soft)',
				borderBottom: '1px solid var(--snd-line-soft)',
				background: 'var(--snd-bg)',
				padding: '20px 0',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					display: 'flex',
					gap: 0,
					whiteSpace: 'nowrap',
					animation: 'snd-ticker 48s linear infinite',
					fontFamily: 'var(--snd-serif)',
					fontStyle: 'italic',
					fontSize: 26,
					color: 'var(--snd-cream-2)',
					fontWeight: 300,
				}}
			>
				{full.map((item, i) => (
					<span
						key={i}
						style={{ display: 'inline-flex', alignItems: 'center', gap: 0 }}
					>
						<span style={{ padding: '0 28px' }}>{item}</span>
						<span style={{ color: 'var(--snd-gold)', fontSize: 14 }}>✦</span>
					</span>
				))}
			</div>
		</div>
	);
}

// ─── The Space ───────────────────────────────────────────────────────────────
function SpaceSection() {
	const imgRef = useRef<HTMLDivElement>(null);
	const isImgInView = useInView(imgRef, { once: true, margin: '-10% 0px' });

	return (
		<section
			id="space"
			style={{
				background: 'var(--snd-bg)',
				padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)',
			}}
		>
			<SectionHead
				num="Nº 01 / THE SPACE"
				title={
					<>
						Quietly considered,{' '}
						<em style={{ color: 'var(--snd-gold)', fontWeight: 400 }}>
							luminously simple.
						</em>
					</>
				}
				subtitle="A collection of studios on the upper floors of Obrenovićeva — each composed as carefully as a hotel suite, with the city laid out beyond the glass."
			/>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
					gap: 'clamp(32px, 6vw, 100px)',
					alignItems: 'center',
				}}
			>
				{/* Photo */}
				<motion.div
					ref={imgRef}
					initial={{ opacity: 0, x: -30 }}
					animate={isImgInView ? { opacity: 1, x: 0 } : {}}
					transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1] }}
					style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 4, overflow: 'hidden' }}
				>
					<Image
						src="/site-assets/images/custom/lounge-window.jpeg"
						alt="Lounge with city view"
						fill
						style={{
							objectFit: 'cover',
							transition: 'transform 1.6s cubic-bezier(.2,.7,.2,1)',
						}}
						className="snd-photo-hover"
					/>
					{/* Floor badge */}
					<div
						style={{
							position: 'absolute',
							left: 22,
							top: 22,
							background: 'rgba(10,14,26,0.80)',
							backdropFilter: 'blur(8px)',
							padding: '12px 16px',
							border: '1px solid var(--snd-line)',
							borderRadius: 4,
						}}
					>
						<span
							style={{
								display: 'block',
								fontFamily: 'var(--snd-mono)',
								fontSize: 9,
								letterSpacing: '0.28em',
								color: 'var(--snd-gold)',
								marginBottom: 4,
							}}
						>
							Studio
						</span>
						<span
							style={{
								fontFamily: 'var(--snd-serif)',
								fontSize: 22,
								fontWeight: 400,
								lineHeight: 1,
								color: 'var(--snd-cream)',
							}}
						>
							Niš Centre
						</span>
					</div>
				</motion.div>

				{/* Text */}
				<div style={{ display: 'grid', gap: 28 }}>
					{[
						{
							text: 'A studio that refuses to feel like one. Honey-toned oak underfoot, a slatted screen separating the bed from the lounge, and a wall of glass facing south over the rooftops of Niš.',
							isDrop: true,
							delay: 0,
						},
						{
							text: 'Mornings begin with espresso at the wood-trim kitchenette; evenings unfold in the striped lounge chair beside the curtain — sheer linen drawn, the city lit gold below. The bath is small and exact: rainfall shower, heated towel bar, a single tall mirror.',
							isDrop: false,
							delay: 0.08,
						},
						{
							text: 'It is a room intended for two — for a quiet weekend, a working visit, an unhurried stop on the way somewhere else.',
							isDrop: false,
							delay: 0.16,
						},
					].map(({ text, delay }, i) => (
						<RevealBlock key={i} delay={delay}>
							<p
								style={{
									fontFamily: 'var(--snd-serif)',
									fontSize: 21,
									lineHeight: 1.55,
									fontWeight: 300,
									color: 'var(--snd-cream-2)',
									margin: 0,
								}}
							>
								{text}
							</p>
						</RevealBlock>
					))}

					<RevealBlock delay={0.24}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 8 }}>
							<span
								style={{ width: 60, height: 1, background: 'var(--snd-gold)', flexShrink: 0 }}
							/>
							<span
								style={{
									fontFamily: 'var(--snd-serif)',
									fontStyle: 'italic',
									fontSize: 20,
									color: 'var(--snd-cream)',
								}}
							>
								The hosts
							</span>
							<span
								style={{
									fontFamily: 'var(--snd-mono)',
									fontSize: 10,
									letterSpacing: '0.24em',
									color: 'var(--snd-muted-2)',
									textTransform: 'uppercase',
								}}
							>
								Stan na Dan
							</span>
						</div>
					</RevealBlock>
				</div>
			</div>
		</section>
	);
}

// ─── Amenities ───────────────────────────────────────────────────────────────
const AMENITIES = [
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<path d="M3 13c3 0 3-2 6-2s3 2 6 2 3-2 6-2" />
				<path d="M3 18c3 0 3-2 6-2s3 2 6 2 3-2 6-2" />
				<path d="M5 8h14" />
			</svg>
		),
		title: 'King Bed',
		desc: '180 cm linen-dressed mattress with Belgian cotton sheets, four pillow options.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<circle cx="12" cy="12" r="3" />
				<path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" />
			</svg>
		),
		title: 'Smart Climate',
		desc: 'Silent inverter A/C, in-floor bath heating, blackout curtains drawn by tassel.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<rect x="3" y="6" width="18" height="12" rx="1" />
				<path d="M3 10h18" />
				<circle cx="7" cy="14" r="0.6" fill="currentColor" />
			</svg>
		),
		title: 'Kitchen Bar',
		desc: 'Espresso machine, induction hob, Riedel glassware, Sicilian olive oil, stocked first morning.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<path d="M3 12c4-6 14-6 18 0" />
				<path d="M6 12c3-4 9-4 12 0" />
				<path d="M9 12c2-2 4-2 6 0" />
				<circle cx="12" cy="14" r="0.8" fill="currentColor" />
			</svg>
		),
		title: '100 Mbps Fibre',
		desc: 'Symmetric internet, mesh Wi-Fi, a desk by the window built for slow afternoons of work.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<rect x="4" y="4" width="16" height="13" rx="0.5" />
				<path d="M9 21l3-4 3 4" />
			</svg>
		),
		title: 'Cinema TV',
		desc: '65″ 4K screen with Netflix, Prime, HBO, and the Champions League in season.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<path d="M7 3v6M17 3v6M7 9h10M5 9h14v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" />
			</svg>
		),
		title: 'Rainfall Shower',
		desc: 'Walk-in glass enclosure, full-height mirror, hairdryer, Aesop body and hair amenities.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<path d="M4 20V8l8-4 8 4v12" />
				<path d="M9 20v-6h6v6" />
			</svg>
		),
		title: 'Private Balcony',
		desc: 'South-facing, two chairs and a small table — the rooftops of Stari Grad in full view.',
	},
	{
		icon: (
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
				<circle cx="12" cy="12" r="9" />
				<path d="M12 7v5l3 2" />
			</svg>
		),
		title: 'Self Check-in',
		desc: 'Keyless entry from 15:00, late arrivals welcomed. Concierge by WhatsApp, day and night.',
	},
];

function AmenitiesSection() {
	return (
		<section
			style={{
				background: 'var(--snd-bg)',
				borderTop: '1px solid var(--snd-line-soft)',
				padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)',
			}}
		>
			<SectionHead
				num="Nº 02 / THE DETAILS"
				title={
					<>
						Everything{' '}
						<em style={{ color: 'var(--snd-gold)', fontWeight: 400 }}>
							arranged for you.
						</em>
					</>
				}
			/>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
					borderTop: '1px solid var(--snd-line-soft)',
				}}
			>
				{AMENITIES.map((a, i) => (
					<RevealBlock key={a.title} delay={(i % 4) * 0.07}>
						<motion.div
							whileHover={{ background: 'rgba(201,168,76,0.04)' }}
							style={{
								padding: '32px 26px',
								borderRight: '1px solid var(--snd-line-soft)',
								borderBottom: '1px solid var(--snd-line-soft)',
								position: 'relative',
								transition: 'background 0.5s ease',
							}}
						>
							<span
								style={{
									position: 'absolute',
									top: 18,
									right: 22,
									fontFamily: 'var(--snd-mono)',
									fontSize: 10,
									letterSpacing: '0.22em',
									color: 'var(--snd-muted-2)',
								}}
							>
								{String(i + 1).padStart(2, '0')}
							</span>
							<div
								style={{
									width: 34,
									height: 34,
									color: 'var(--snd-gold)',
									marginBottom: 26,
								}}
							>
								{a.icon}
							</div>
							<h4
								style={{
									fontFamily: 'var(--snd-serif)',
									fontSize: 21,
									fontWeight: 400,
									marginBottom: 8,
									color: 'var(--snd-cream)',
								}}
							>
								{a.title}
							</h4>
							<p
								style={{
									fontSize: 13,
									color: 'var(--snd-muted)',
									lineHeight: 1.58,
									margin: 0,
								}}
							>
								{a.desc}
							</p>
						</motion.div>
					</RevealBlock>
				))}
			</div>
		</section>
	);
}

// ─── Apartment card with 3D tilt ─────────────────────────────────────────────
function ApartmentCard({ apartment, index }: { apartment: Apartment; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const rotateX = useMotionValue(0);
	const rotateY = useMotionValue(0);
	const springX = useSpring(rotateX, { stiffness: 280, damping: 22 });
	const springY = useSpring(rotateY, { stiffness: 280, damping: 22 });
	const cardRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

	const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width - 0.5;
		const y = (e.clientY - rect.top) / rect.height - 0.5;
		rotateY.set(x * 12);
		rotateX.set(-y * 8);
	}, [rotateX, rotateY]);

	const handleLeave = useCallback(() => {
		rotateX.set(0);
		rotateY.set(0);
	}, [rotateX, rotateY]);

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 36 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 1.1, delay: index * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
			style={{ perspective: 1000 }}
		>
			<motion.div
				ref={cardRef}
				onMouseMove={handleMove}
				onMouseLeave={handleLeave}
				style={{
					rotateX: springX,
					rotateY: springY,
					borderRadius: 4,
					overflow: 'hidden',
					border: '1px solid var(--snd-line-soft)',
					background: 'var(--snd-bg-2)',
					cursor: 'pointer',
					transformStyle: 'preserve-3d',
				}}
				whileHover={{ scale: 1.01 }}
				transition={{ scale: { duration: 0.4 } }}
			>
				{/* Image */}
				<div
					style={{
						position: 'relative',
						height: 320,
						overflow: 'hidden',
					}}
				>
					<motion.div
						style={{
							position: 'absolute',
							inset: 0,
						}}
						whileHover={{ scale: 1.06 }}
						transition={{ duration: 1.4, ease: [0.2, 0.7, 0.2, 1] }}
					>
						<Image
							src={apartment.coverImage}
							alt={apartment.name}
							fill
							style={{ objectFit: 'cover', filter: 'saturate(0.88)' }}
						/>
					</motion.div>
					{/* Price badge */}
					<div
						style={{
							position: 'absolute',
							right: 18,
							bottom: 18,
							background: 'rgba(10,14,26,0.80)',
							backdropFilter: 'blur(8px)',
							border: '1px solid var(--snd-line)',
							borderRadius: 4,
							padding: '10px 16px',
						}}
					>
						<span
							style={{
								fontFamily: 'var(--snd-serif)',
								fontSize: 20,
								fontWeight: 400,
								color: 'var(--snd-cream)',
							}}
						>
							€{apartment.pricePerNight}
							<small
								style={{
									fontFamily: 'var(--snd-mono)',
									fontSize: 10,
									color: 'var(--snd-muted)',
									marginLeft: 4,
								}}
							>
								/ night
							</small>
						</span>
					</div>
					{/* Warm overlay on hover */}
					<motion.div
						style={{
							position: 'absolute',
							inset: 0,
							background:
								'linear-gradient(180deg, transparent 40%, rgba(201,168,76,0) 100%)',
							pointerEvents: 'none',
						}}
						whileHover={{
							background:
								'linear-gradient(180deg, transparent 30%, rgba(201,168,76,0.18) 100%)',
						}}
						transition={{ duration: 0.6 }}
					/>
				</div>

				{/* Info */}
				<div style={{ padding: '24px 28px 28px' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'flex-start',
							marginBottom: 12,
							gap: 12,
						}}
					>
						<h3
							style={{
								fontFamily: 'var(--snd-serif)',
								fontSize: 26,
								fontWeight: 400,
								color: 'var(--snd-cream)',
								margin: 0,
							}}
						>
							{apartment.name}
						</h3>
						<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
							<span style={{ color: 'var(--snd-gold)', fontSize: 12 }}>★</span>
							<span
								style={{
									fontFamily: 'var(--snd-mono)',
									fontSize: 12,
									color: 'var(--snd-cream)',
								}}
							>
								{apartment.rating}
							</span>
							<span
								style={{
									fontFamily: 'var(--snd-mono)',
									fontSize: 10,
									color: 'var(--snd-muted-2)',
								}}
							>
								({apartment.reviewCount})
							</span>
						</div>
					</div>

					<p
						style={{
							fontFamily: 'var(--snd-serif)',
							fontSize: 17,
							color: 'var(--snd-muted)',
							lineHeight: 1.5,
							margin: '0 0 20px',
						}}
					>
						{apartment.teaser}
					</p>

					<div
						style={{
							display: 'flex',
							gap: 20,
							paddingTop: 18,
							borderTop: '1px solid var(--snd-line-soft)',
						}}
					>
						{[
							{ k: 'Guests', v: `${apartment.guests}` },
							{ k: 'Beds', v: `${apartment.beds}` },
							{ k: 'Size', v: `${apartment.size}m²` },
						].map(({ k, v }) => (
							<div key={k}>
								<span
									style={{
										display: 'block',
										fontFamily: 'var(--snd-mono)',
										fontSize: 9,
										letterSpacing: '0.2em',
										textTransform: 'uppercase',
										color: 'var(--snd-muted-2)',
										marginBottom: 5,
									}}
								>
									{k}
								</span>
								<span
									style={{
										fontFamily: 'var(--snd-serif)',
										fontSize: 18,
										fontWeight: 400,
										color: 'var(--snd-cream)',
									}}
								>
									{v}
								</span>
							</div>
						))}
					</div>

					<Link
						href={`/apartments/${apartment.slug}`}
						className="snd-ghost-btn"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 12,
							marginTop: 22,
							padding: '11px 22px',
							border: '1px solid var(--snd-gold)',
							color: 'var(--snd-gold)',
							fontFamily: 'var(--snd-mono)',
							fontSize: 10,
							letterSpacing: '0.24em',
							textTransform: 'uppercase',
							borderRadius: 4,
							textDecoration: 'none',
						}}
					>
						<span>View & Reserve</span>
						<span
							style={{
								width: 16,
								height: 1,
								background: 'currentColor',
								position: 'relative',
								display: 'inline-block',
								flexShrink: 0,
							}}
						>
							<span
								style={{
									position: 'absolute',
									right: -1,
									top: -3,
									width: 6,
									height: 6,
									borderRight: '1px solid currentColor',
									borderTop: '1px solid currentColor',
									transform: 'rotate(45deg)',
									display: 'block',
								}}
							/>
						</span>
					</Link>
				</div>
			</motion.div>
		</motion.div>
	);
}

function ApartmentsSection({ apartments }: { apartments: Apartment[] }) {
	return (
		<section
			id="apartments"
			style={{
				background: 'var(--snd-bg-2)',
				borderTop: '1px solid var(--snd-line-soft)',
				padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)',
			}}
		>
			<SectionHead
				num="Nº 03 / THE APARTMENTS"
				title={
					<>
						Choose your{' '}
						<em style={{ color: 'var(--snd-gold)', fontWeight: 400 }}>space.</em>
					</>
				}
				subtitle="Each apartment is independently considered — different in scale, alike in care."
			/>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
					gap: 28,
				}}
			>
				{apartments.map((apt, i) => (
					<ApartmentCard key={apt.id} apartment={apt} index={i} />
				))}
			</div>
		</section>
	);
}

// ─── Gallery film strip ───────────────────────────────────────────────────────
const GALLERY_PHOTOS = [
	{ src: '/site-assets/images/custom/studio-wide.jpeg', label: 'The studio at noon', num: '01' },
	{ src: '/site-assets/images/custom/bedroom-night.jpeg', label: 'After hours', num: '02' },
	{ src: '/site-assets/images/custom/lounge-window.jpeg', label: 'Morning chair', num: '03' },
	{ src: '/site-assets/images/custom/living-tv.jpeg', label: 'Kitchen bar', num: '04' },
	{ src: '/site-assets/images/custom/studio-vertical.jpeg', label: 'The long view', num: '05' },
	{ src: '/site-assets/images/custom/kitchen-tv.jpeg', label: 'Workspace', num: '06' },
];

function GallerySection() {
	const trackRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	return (
		<section
			id="gallery"
			style={{
				background: 'var(--snd-bg)',
				borderTop: '1px solid var(--snd-line-soft)',
				padding: 'clamp(80px, 10vw, 140px) 0',
			}}
		>
			<div style={{ padding: '0 clamp(20px, 5vw, 80px)' }}>
				<SectionHead
					num="Nº 04 / GALLERY"
					title={
						<>
							Light, hour{' '}
							<em style={{ color: 'var(--snd-gold)', fontWeight: 400 }}>by hour.</em>
						</>
					}
				/>
			</div>

			{/* Film strip */}
			<div
				ref={containerRef}
				style={{
					overflow: 'hidden',
					cursor: isDragging ? 'grabbing' : 'grab',
					userSelect: 'none',
					paddingBottom: 12,
				}}
			>
				<motion.div
					ref={trackRef}
					drag="x"
					dragConstraints={containerRef}
					dragElastic={0.12}
					onDragStart={() => setIsDragging(true)}
					onDragEnd={() => setIsDragging(false)}
					style={{
						display: 'flex',
						gap: 16,
						padding: '0 clamp(20px, 5vw, 80px)',
						width: 'max-content',
					}}
					whileTap={{ cursor: 'grabbing' }}
				>
					{GALLERY_PHOTOS.map((photo) => (
						<motion.div
							key={photo.num}
							style={{
								position: 'relative',
								width: 'clamp(280px, 32vw, 500px)',
								height: 'clamp(360px, 44vw, 640px)',
								flexShrink: 0,
								borderRadius: 4,
								overflow: 'hidden',
							}}
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
						>
							<Image
								src={photo.src}
								alt={photo.label}
								fill
								style={{
									objectFit: 'cover',
									filter: 'saturate(0.85)',
									pointerEvents: 'none',
								}}
								draggable={false}
							/>
							<motion.div
								initial={{ opacity: 0 }}
								whileHover={{ opacity: 1 }}
								transition={{ duration: 0.4 }}
								style={{
									position: 'absolute',
									inset: 0,
									background:
										'linear-gradient(180deg, transparent 50%, rgba(201,168,76,0.22) 100%)',
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: 18,
									bottom: 18,
									pointerEvents: 'none',
								}}
							>
								<span
									style={{
										display: 'block',
										fontFamily: 'var(--snd-mono)',
										fontSize: 9,
										letterSpacing: '0.28em',
										color: 'var(--snd-gold)',
										marginBottom: 5,
									}}
								>
									Plate {photo.num}
								</span>
								<span
									style={{
										fontFamily: 'var(--snd-serif)',
										fontStyle: 'italic',
										fontSize: 20,
										color: 'var(--snd-cream)',
									}}
								>
									{photo.label}
								</span>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>

			<div
				style={{
					padding: '40px clamp(20px, 5vw, 80px) 0',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<RevealBlock>
					<span
						style={{
							fontFamily: 'var(--snd-serif)',
							fontStyle: 'italic',
							fontSize: 20,
							color: 'var(--snd-muted)',
						}}
					>
						{GALLERY_PHOTOS.length} plates · drag to explore
					</span>
				</RevealBlock>
				<RevealBlock delay={0.1}>
					<Link
						href="/apartments"
						className="snd-ghost-btn"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 14,
							padding: '13px 26px',
							border: '1px solid var(--snd-gold)',
							color: 'var(--snd-gold)',
							fontFamily: 'var(--snd-mono)',
							fontSize: 11,
							letterSpacing: '0.24em',
							textTransform: 'uppercase',
							borderRadius: 4,
							textDecoration: 'none',
						}}
					>
						<span>See all apartments</span>
						<span
							style={{
								width: 18,
								height: 1,
								background: 'currentColor',
								position: 'relative',
								display: 'inline-block',
								flexShrink: 0,
							}}
						>
							<span
								style={{
									position: 'absolute',
									right: -1,
									top: -3,
									width: 7,
									height: 7,
									borderRight: '1px solid currentColor',
									borderTop: '1px solid currentColor',
									transform: 'rotate(45deg)',
									display: 'block',
								}}
							/>
						</span>
					</Link>
				</RevealBlock>
			</div>
		</section>
	);
}

// ─── Why Niš ─────────────────────────────────────────────────────────────────
const DISTANCES = [
	{ num: '01', name: 'Niš Fortress', kind: 'Roman ruins', dur: '5 min walk' },
	{ num: '02', name: 'Kazandžijsko Sokače', kind: 'Old bazaar', dur: '6 min walk' },
	{ num: '03', name: 'King Milan Square', kind: 'City centre', dur: '3 min walk' },
	{ num: '04', name: 'Nišava Promenade', kind: 'River walk', dur: '7 min walk' },
	{ num: '05', name: 'Ćele Kula', kind: 'Monument', dur: '9 min drive' },
	{ num: '06', name: 'Konstantin Veliki Airport', kind: 'INI', dur: '17 min drive' },
	{ num: '07', name: 'Belgrade', kind: 'By motorway', dur: '2 hr 20 min' },
];

function NisSection() {
	return (
		<section
			id="nis"
			style={{
				background: 'var(--snd-cream)',
				color: 'var(--snd-bg)',
				padding: 'clamp(80px, 11vw, 160px) clamp(20px, 5vw, 80px)',
			}}
		>
			<SectionHead
				num="Nº 05 / WHY NIŠ"
				title={
					<>
						The oldest city in the Balkans,{' '}
						<em style={{ color: '#B8923C', fontWeight: 400 }}>
							quietly rediscovered.
						</em>
					</>
				}
				light
			/>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
					gap: 'clamp(40px, 6vw, 80px)',
					alignItems: 'start',
				}}
			>
				<RevealBlock>
					<div
						style={{
							fontFamily: 'var(--snd-serif)',
							fontSize: 21,
							lineHeight: 1.58,
							color: '#2A2A2A',
							fontWeight: 300,
							display: 'grid',
							gap: 20,
						}}
					>
						<p style={{ margin: 0 }}>
							Founded by the Romans and walked by Constantine the Great, Niš is the soft
							third city of Serbia — old stone, riverside cafés, a covered market, and a
							1,700-year-old fortress at its heart.
						</p>
						<p style={{ margin: 0 }}>
							You will spend a morning in the bazaar at Kazandžijsko sokače, an afternoon
							under the plane trees by the Nišava, and an evening on Kopitareva — where
							the kitchens of southern Serbia keep candles burning until late.
						</p>
						<p style={{ margin: 0 }}>
							Twenty minutes from the airport. A pace that rewards arriving slowly.
						</p>
						<div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 8 }}>
							<span style={{ width: 60, height: 1, background: '#806423', display: 'block', flexShrink: 0 }} />
							<span
								style={{
									fontFamily: 'var(--snd-serif)',
									fontStyle: 'italic',
									fontSize: 18,
								}}
							>
								A short letter from the hosts
							</span>
						</div>
					</div>
				</RevealBlock>

				<RevealBlock delay={0.1}>
					<div style={{ borderTop: '1px solid rgba(0,0,0,0.12)' }}>
						{DISTANCES.map((d) => (
							<motion.div
								key={d.num}
								whileHover={{ paddingLeft: 14 }}
								style={{
									display: 'grid',
									gridTemplateColumns: '52px 1fr auto auto',
									gap: 20,
									alignItems: 'center',
									padding: '20px 0',
									borderBottom: '1px solid rgba(0,0,0,0.10)',
									transition: 'padding-left 0.4s ease',
									position: 'relative',
								}}
							>
								<motion.span
									style={{
										position: 'absolute',
										left: 0,
										top: '50%',
										translateY: '-50%',
										height: 1,
										background: '#B8923C',
										width: 0,
									}}
									whileHover={{ width: 10 }}
									transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
								/>
								<span
									style={{
										fontFamily: 'var(--snd-mono)',
										fontSize: 10,
										letterSpacing: '0.24em',
										color: '#806423',
									}}
								>
									{d.num}
								</span>
								<span
									style={{
										fontFamily: 'var(--snd-serif)',
										fontSize: 22,
										fontWeight: 400,
									}}
								>
									{d.name}
								</span>
								<span
									style={{
										fontFamily: 'var(--snd-mono)',
										fontSize: 9,
										letterSpacing: '0.22em',
										color: 'rgba(0,0,0,0.45)',
										textTransform: 'uppercase',
									}}
								>
									{d.kind}
								</span>
								<span
									style={{
										fontFamily: 'var(--snd-serif)',
										fontStyle: 'italic',
										fontSize: 20,
										color: '#B8923C',
										textAlign: 'right',
									}}
								>
									{d.dur}
								</span>
							</motion.div>
						))}
					</div>
				</RevealBlock>
			</div>
		</section>
	);
}

// ─── Booking CTA ─────────────────────────────────────────────────────────────
function BookingCTA() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-10% 0px' });

	return (
		<section
			id="booking"
			style={{
				background: 'var(--snd-bg-2)',
				borderTop: '1px solid var(--snd-line-soft)',
				padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 80px)',
			}}
		>
			<div
				ref={ref}
				style={{
					maxWidth: 880,
					margin: '0 auto',
					textAlign: 'center',
					display: 'grid',
					gap: 36,
				}}
			>
				<motion.span
					initial={{ opacity: 0, y: 16 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
					style={{
						fontFamily: 'var(--snd-mono)',
						fontSize: 10,
						letterSpacing: '0.3em',
						textTransform: 'uppercase',
						color: 'var(--snd-gold)',
						display: 'block',
					}}
				>
					Nº 06 / RESERVE
				</motion.span>

				<motion.h2
					initial={{ opacity: 0, y: 22 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 1.0, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
					style={{
						fontFamily: 'var(--snd-serif)',
						fontSize: 'clamp(44px, 6vw, 80px)',
						fontWeight: 300,
						lineHeight: 1.05,
						letterSpacing: '-0.025em',
						color: 'var(--snd-cream)',
						margin: 0,
					}}
				>
					Choose a{' '}
					<em style={{ color: 'var(--snd-gold)', fontWeight: 400 }}>night.</em>
				</motion.h2>

				<motion.p
					initial={{ opacity: 0, y: 18 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.9, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
					style={{
						fontFamily: 'var(--snd-serif)',
						fontStyle: 'italic',
						fontSize: 20,
						color: 'var(--snd-muted)',
						lineHeight: 1.5,
						maxWidth: '52ch',
						margin: '0 auto',
					}}
				>
					Direct bookings include a welcome bottle of Tikveš Vranac and a handwritten
					note. We reply to every enquiry within an hour.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 14 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
					style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
				>
					<Link
						href="/availability"
						className="snd-ghost-btn"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 14,
							padding: '16px 32px',
							border: '1px solid var(--snd-gold)',
							color: 'var(--snd-gold)',
							fontFamily: 'var(--snd-mono)',
							fontSize: 11,
							letterSpacing: '0.24em',
							textTransform: 'uppercase',
							borderRadius: 4,
							textDecoration: 'none',
						}}
					>
						<span>Check Availability</span>
						<span
							style={{
								width: 18,
								height: 1,
								background: 'currentColor',
								position: 'relative',
								display: 'inline-block',
								flexShrink: 0,
							}}
						>
							<span
								style={{
									position: 'absolute',
									right: -1,
									top: -3,
									width: 7,
									height: 7,
									borderRight: '1px solid currentColor',
									borderTop: '1px solid currentColor',
									transform: 'rotate(45deg)',
									display: 'block',
								}}
							/>
						</span>
					</Link>
					<Link
						href="/contact"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 10,
							padding: '16px 28px',
							border: '1px solid var(--snd-line-soft)',
							color: 'var(--snd-muted)',
							fontFamily: 'var(--snd-mono)',
							fontSize: 11,
							letterSpacing: '0.24em',
							textTransform: 'uppercase',
							borderRadius: 4,
							textDecoration: 'none',
							transition: 'color 0.3s ease, border-color 0.3s ease',
						}}
					>
						Ask a question
					</Link>
				</motion.div>

				{/* Rate info */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ duration: 0.9, delay: 0.45 }}
					style={{
						display: 'flex',
						gap: 32,
						justifyContent: 'center',
						flexWrap: 'wrap',
						paddingTop: 32,
						borderTop: '1px solid var(--snd-line-soft)',
					}}
				>
					{[
						{ k: 'Weeknight', v: 'from €54' },
						{ k: 'Weekend', v: 'from €72' },
						{ k: 'Cleaning', v: '€12–18' },
						{ k: '7+ nights', v: '−12%' },
					].map(({ k, v }) => (
						<div key={k} style={{ textAlign: 'center' }}>
							<span
								style={{
									display: 'block',
									fontFamily: 'var(--snd-mono)',
									fontSize: 9,
									letterSpacing: '0.22em',
									textTransform: 'uppercase',
									color: 'var(--snd-muted-2)',
									marginBottom: 7,
								}}
							>
								{k}
							</span>
							<span
								style={{
									fontFamily: 'var(--snd-serif)',
									fontSize: 20,
									fontWeight: 400,
									color: 'var(--snd-cream)',
								}}
							>
								{v}
							</span>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
const REVIEWS = [
	{
		stars: 5,
		text: '"Easily the best stay we had in the Balkans. The host left a handwritten welcome card and a bottle of local red. The bed was a cloud, the view was a film."',
		name: 'Adèle, Paris',
		meta: 'March · 2 nights',
		initial: 'A',
	},
	{
		stars: 5,
		text: '"Worked from the desk for a week. Internet flawless, espresso machine excellent, neighbourhood quiet at night. I\'ll be back in autumn."',
		name: 'Marcus, Berlin',
		meta: 'February · 6 nights',
		initial: 'M',
	},
	{
		stars: 5,
		text: '"The photographs do not do it justice. Milena replied to every message within minutes. The Tvrđava at sunrise — from your balcony — is reason enough to come."',
		name: 'Lana & Tomislav',
		meta: 'January · weekend',
		initial: 'L',
	},
];

function ReviewsSection() {
	return (
		<section
			id="guestbook"
			style={{
				padding: 'clamp(80px, 10vw, 160px) clamp(20px, 5vw, 80px)',
				borderTop: '1px solid var(--snd-line-soft)',
				background: 'var(--snd-bg)',
			}}
		>
			<SectionHead
				num="Nº 07 / GUESTBOOK"
				title={
					<>
						A few{' '}
						<em style={{ color: 'var(--snd-gold)', fontWeight: 400 }}>kind notes.</em>
					</>
				}
			/>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: 28,
					marginBottom: 72,
				}}
			>
				{REVIEWS.map((r, i) => (
					<RevealBlock key={r.name} delay={i * 0.1}>
						<motion.div
							whileHover={{ y: -6, borderColor: 'var(--snd-line)' }}
							transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
							style={{
								padding: '36px 30px',
								border: '1px solid var(--snd-line-soft)',
								borderRadius: 4,
								background: 'linear-gradient(180deg, rgba(201,168,76,0.025), transparent)',
								display: 'grid',
								gap: 24,
								position: 'relative',
							}}
						>
							<div
								style={{
									position: 'absolute',
									top: 10,
									right: 22,
									fontFamily: 'var(--snd-serif)',
									fontStyle: 'italic',
									fontSize: 90,
									color: 'var(--snd-gold)',
									opacity: 0.28,
									lineHeight: 1,
									pointerEvents: 'none',
								}}
							>
								"
							</div>
							<div style={{ display: 'flex', gap: 3, color: 'var(--snd-gold)', fontSize: 13 }}>
								{'★'.repeat(r.stars)}
							</div>
							<p
								style={{
									fontFamily: 'var(--snd-serif)',
									fontSize: 20,
									lineHeight: 1.48,
									fontWeight: 300,
									color: 'var(--snd-cream)',
									margin: 0,
								}}
							>
								{r.text}
							</p>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 14,
									paddingTop: 20,
									borderTop: '1px solid var(--snd-line-soft)',
								}}
							>
								<div
									style={{
										width: 42,
										height: 42,
										borderRadius: '50%',
										background: 'var(--snd-bg-3)',
										border: '1px solid var(--snd-line)',
										display: 'grid',
										placeItems: 'center',
										fontFamily: 'var(--snd-serif)',
										fontStyle: 'italic',
										color: 'var(--snd-gold)',
										fontSize: 17,
										flexShrink: 0,
									}}
								>
									{r.initial}
								</div>
								<div>
									<div
										style={{
											fontFamily: 'var(--snd-serif)',
											fontStyle: 'italic',
											fontSize: 18,
											color: 'var(--snd-cream)',
										}}
									>
										{r.name}
									</div>
									<div
										style={{
											fontFamily: 'var(--snd-mono)',
											fontSize: 10,
											letterSpacing: '0.22em',
											color: 'var(--snd-muted-2)',
											textTransform: 'uppercase',
										}}
									>
										{r.meta}
									</div>
								</div>
							</div>
						</motion.div>
					</RevealBlock>
				))}
			</div>

			{/* Score bar */}
			<RevealBlock>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingTop: 36,
						borderTop: '1px solid var(--snd-line-soft)',
						flexWrap: 'wrap',
						gap: 24,
					}}
				>
					<div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
						<span
							style={{
								fontFamily: 'var(--snd-serif)',
								fontSize: 'clamp(60px, 8vw, 90px)',
								color: 'var(--snd-gold)',
								lineHeight: 1,
								fontWeight: 300,
							}}
						>
							4.95
						</span>
						<div style={{ display: 'grid', gap: 6 }}>
							<div style={{ color: 'var(--snd-gold)', fontSize: 14, letterSpacing: 2 }}>
								★★★★★
							</div>
							<span
								style={{
									fontFamily: 'var(--snd-mono)',
									fontSize: 10,
									letterSpacing: '0.22em',
									color: 'var(--snd-muted)',
									textTransform: 'uppercase',
								}}
							>
								273 reviews
							</span>
						</div>
					</div>
					<Link
						href="/apartments"
						className="snd-ghost-btn"
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 14,
							padding: '13px 26px',
							border: '1px solid var(--snd-gold)',
							color: 'var(--snd-gold)',
							fontFamily: 'var(--snd-mono)',
							fontSize: 11,
							letterSpacing: '0.24em',
							textTransform: 'uppercase',
							borderRadius: 4,
							textDecoration: 'none',
						}}
					>
						<span>Browse apartments</span>
						<span
							style={{
								width: 18,
								height: 1,
								background: 'currentColor',
								position: 'relative',
								display: 'inline-block',
								flexShrink: 0,
							}}
						>
							<span
								style={{
									position: 'absolute',
									right: -1,
									top: -3,
									width: 7,
									height: 7,
									borderRight: '1px solid currentColor',
									borderTop: '1px solid currentColor',
									transform: 'rotate(45deg)',
									display: 'block',
								}}
							/>
						</span>
					</Link>
				</div>
			</RevealBlock>
		</section>
	);
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function HomePageClient({ property, apartments }: HomePageClientProps) {
	return (
		<div className="snd-page">
			<PageCurtain />
			<HeroSection property={property} />
			<TickerSection />
			<SpaceSection />
			<AmenitiesSection />
			<ApartmentsSection apartments={apartments} />
			<GallerySection />
			<NisSection />
			<BookingCTA />
			<ReviewsSection />
		</div>
	);
}
