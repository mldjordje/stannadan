'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

type PageHeroProps = {
	kicker: string;
	title: React.ReactNode;
	description?: string;
	image: string;
	imagePosition?: string;
	crumb?: string;
	meta?: { label: string; value: string }[];
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Inner-page opening plate — same cinema grammar as the home hero, shorter. */
function PageHero({ kicker, title, description, image, imagePosition = '50% 45%', crumb, meta }: PageHeroProps) {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
	const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
	const scale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);

	return (
		<section
			ref={ref}
			className="snd-pagehero"
		>
			<motion.div
				className="snd-pagehero-media"
				style={{ y, scale }}
			>
				<Image
					src={image}
					alt=""
					fill
					priority
					sizes="100vw"
					style={{ objectFit: 'cover', objectPosition: imagePosition }}
				/>
			</motion.div>

			<div className="snd-wrap">
				<motion.div
					className="snd-stack"
					initial={{ opacity: 0, y: 26 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: EASE }}
				>
					<span className="snd-crumbs">
						<Link href="/">Početna</Link>
						<span className="sep">/</span>
						<span>{crumb ?? kicker}</span>
					</span>
					<span className="snd-eyebrow">{kicker}</span>
					<h1 className="snd-pagehero-title">{title}</h1>
					{description ? (
						<p
							className="snd-lede"
							style={{ maxWidth: '58ch' }}
						>
							{description}
						</p>
					) : null}
					{meta?.length ? (
						<div
							className="snd-stats"
							style={{ maxWidth: 520 }}
						>
							{meta.map((item) => (
								<div key={item.label}>
									<span className="k">{item.label}</span>
									<span className="v">{item.value}</span>
								</div>
							))}
						</div>
					) : null}
				</motion.div>
			</div>
		</section>
	);
}

export default PageHero;
