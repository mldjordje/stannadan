'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

type Stat = {
	label: string;
	value: string;
	suffix?: string;
};

type HeroSceneProps = {
	image: string;
	word: string;
	accentIndex?: number;
	eyebrow: string;
	address: string;
	tagline: React.ReactNode;
	stats: Stat[];
	primary: { href: string; label: string };
	secondary?: { href: string; label: string };
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * Full-bleed opening scene: one photograph, one word, one price.
 * The plate drifts and fades as the page scrolls off it.
 */
function HeroScene({
	image,
	word,
	accentIndex = 1,
	eyebrow,
	address,
	tagline,
	stats,
	primary,
	secondary
}: HeroSceneProps) {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

	const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
	const mediaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.16]);
	const contentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
	const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

	return (
		<section
			ref={ref}
			className="snd-hero"
		>
			<motion.div
				className="snd-hero-media"
				style={{ y: mediaY, scale: mediaScale }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.6, ease: EASE }}
			>
				<Image
					src={image}
					alt=""
					fill
					priority
					sizes="100vw"
					style={{ objectFit: 'cover' }}
				/>
			</motion.div>
			<div className="snd-hero-veil" />

			<motion.div
				className="snd-hero-inner"
				style={{ y: contentY, opacity: contentOpacity }}
			>
				<motion.div
					className="snd-hero-meta"
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
				>
					<div className="left">
						<span className="snd-pip-row">
							<span className="snd-pip" />
							<span className="snd-eyebrow">{eyebrow}</span>
						</span>
						<span className="snd-mono">{address}</span>
					</div>
					<span className="snd-mono">43&#176;19&#8242;N &#183; 21&#176;54&#8242;E</span>
				</motion.div>

				<div className="snd-hero-grid">
					<h1
						className="snd-hero-display"
						aria-label={word}
					>
						{word.split('').map((char, index) => (
							<motion.span
								key={`${char}-${index}`}
								className={`ch${index === accentIndex ? ' is-accent' : ''}`}
								aria-hidden="true"
								initial={{ y: '110%', opacity: 0 }}
								animate={{ y: '0%', opacity: 1 }}
								transition={{ duration: 1.15, delay: 0.15 + index * 0.11, ease: EASE }}
							>
								{char}
							</motion.span>
						))}
					</h1>

					<motion.div
						className="snd-hero-side"
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.55, ease: EASE }}
					>
						<p className="snd-hero-tagline">{tagline}</p>

						<div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
							<Link
								href={primary.href}
								className="snd-btn"
							>
								<span>{primary.label}</span>
								<span className="snd-arr" />
							</Link>
							{secondary ? (
								<Link
									href={secondary.href}
									className="snd-tlink"
									style={{ alignSelf: 'center' }}
								>
									<span>{secondary.label}</span>
								</Link>
							) : null}
						</div>

						<div className="snd-stats">
							{stats.map((stat) => (
								<div key={stat.label}>
									<span className="k">{stat.label}</span>
									<span className="v">
										{stat.value}
										{stat.suffix ? <small>{stat.suffix}</small> : null}
									</span>
								</div>
							))}
						</div>
					</motion.div>
				</div>
			</motion.div>

			<motion.div
				className="snd-hero-foot"
				style={{ opacity: contentOpacity }}
			>
				<span className="snd-mono">Direktna rezervacija &#183; bez provizije</span>
				<span className="snd-scroll-cue">
					<span className="line" />
					Skroluj
				</span>
			</motion.div>
		</section>
	);
}

export default HeroScene;
