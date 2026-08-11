'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type BookingPillProps = {
	fromPrice: string;
	href: string;
	label?: string;
};

/**
 * Fixed price pill. Appears after the hero, follows the pointer slightly
 * (magnetic), and deep links to the booking surface.
 */
function BookingPill({ fromPrice, href, label = 'Slobodno večeras · od' }: BookingPillProps) {
	const { scrollY } = useScroll();
	const [visible, setVisible] = useState(false);

	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
	const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
	const rotate = useTransform(sx, [-40, 40], [-2, 2]);

	useEffect(() => {
		const unsubscribe = scrollY.on('change', (value) => {
			setVisible(value > 480);
		});

		return () => unsubscribe();
	}, [scrollY]);

	function onMove(event: ReactPointerEvent<HTMLDivElement>) {
		const rect = event.currentTarget.getBoundingClientRect();
		x.set((event.clientX - (rect.left + rect.width / 2)) * 0.22);
		y.set((event.clientY - (rect.top + rect.height / 2)) * 0.22);
	}

	function onLeave() {
		x.set(0);
		y.set(0);
	}

	return (
		<div className="snd-pill-host">
			<AnimatePresence>
				{visible ? (
					<motion.div
						initial={{ opacity: 0, y: 26, scale: 0.94 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.94 }}
						transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
						onPointerMove={onMove}
						onPointerLeave={onLeave}
					>
						<motion.div style={{ x: sx, y: sy, rotate }}>
							<Link
								href={href}
								className="snd-pill"
							>
								<span className="snd-pip" />
								<span className="col">
									<span className="k">{label}</span>
									<span className="v">
										{fromPrice} <small>/ noć</small>
									</span>
								</span>
								<span
									className="snd-arr"
									style={{ color: 'var(--gold)' }}
								/>
							</Link>
						</motion.div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

export default BookingPill;
