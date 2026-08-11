'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useRef, useState } from 'react';

type Slide = {
	kicker: string;
	title: React.ReactNode;
	body: string;
};

type CinemaSceneProps = {
	image: string;
	objectPosition?: string;
	slides: Slide[];
	/** viewport heights of scroll the scene holds */
	length?: number;
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * A single photograph pinned to the viewport while the story advances over it.
 * Vertical scroll only — nothing here scrolls sideways.
 */
function CinemaScene({ image, objectPosition = '50% 50%', slides, length = 3 }: CinemaSceneProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [index, setIndex] = useState(0);
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

	const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1]);
	const y = useTransform(scrollYProgress, [0, 1], ['-3%', '3%']);

	useMotionValueEvent(scrollYProgress, 'change', (value) => {
		const next = Math.min(slides.length - 1, Math.max(0, Math.floor(value * slides.length * 0.999)));

		setIndex(next);
	});

	const active = slides[index];

	return (
		<div
			ref={ref}
			className="snd-cinema"
			style={{ height: `${length * 100}svh` }}
		>
			<div className="snd-cinema-pin">
				<motion.div
					className="snd-cinema-media"
					style={{ scale, y }}
				>
					<Image
						src={image}
						alt=""
						fill
						sizes="100vw"
						style={{ objectFit: 'cover', objectPosition }}
					/>
				</motion.div>
				<div className="snd-cinema-veil" />

				<div className="snd-cinema-inner">
					<motion.div
						key={index}
						className="snd-cinema-slide"
						initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
						animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.75, ease: EASE }}
					>
						<span className="snd-eyebrow">{active.kicker}</span>
						<h3>{active.title}</h3>
						<p>{active.body}</p>
					</motion.div>

					<div className="snd-cinema-rail">
						{slides.map((slide, slideIndex) => (
							<i
								key={slide.kicker}
								className={slideIndex <= index ? 'is-on' : undefined}
							/>
						))}
						<span
							className="snd-mono"
							style={{ marginLeft: 12 }}
						>
							{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CinemaScene;
