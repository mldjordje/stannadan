'use client';

import { motion } from 'motion/react';
import type { ElementType, ReactNode } from 'react';

type RevealProps = {
	children: ReactNode;
	/** stagger index — 80ms apart */
	delay?: number;
	/** travel distance in px */
	y?: number;
	className?: string;
	as?: ElementType;
	amount?: number;
};

/**
 * Scroll reveal primitive used across the client site.
 * Plays once, respects reduced motion through the global CSS override.
 */
function Reveal({ children, delay = 0, y = 26, className, as = 'div', amount = 0.25 }: RevealProps) {
	const MotionTag = motion[as as 'div'] ?? motion.div;

	return (
		<MotionTag
			className={className}
			initial={{ opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount }}
			transition={{ duration: 1, delay: delay * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
		>
			{children}
		</MotionTag>
	);
}

export default Reveal;
