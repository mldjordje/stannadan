'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Fixed atmosphere layer for the client site:
 * film grain, a gold light that trails the cursor, and the scroll progress rule.
 * Pointer effects are desktop only and are skipped for reduced-motion users.
 */
function Atmosphere() {
	const { scrollYProgress } = useScroll();
	const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
	const lightRef = useRef<HTMLDivElement>(null);
	const [pointerFine, setPointerFine] = useState(false);

	useEffect(() => {
		const fine = window.matchMedia('(pointer: fine)').matches;
		const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		setPointerFine(fine && !calm);
	}, []);

	useEffect(() => {
		if (!pointerFine) {
			return undefined;
		}

		let frame = 0;
		let targetX = window.innerWidth / 2;
		let targetY = window.innerHeight / 2;
		let currentX = targetX;
		let currentY = targetY;

		function onMove(event: PointerEvent) {
			targetX = event.clientX;
			targetY = event.clientY;
		}

		function loop() {
			currentX += (targetX - currentX) * 0.08;
			currentY += (targetY - currentY) * 0.08;

			if (lightRef.current) {
				lightRef.current.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
			}

			frame = window.requestAnimationFrame(loop);
		}

		window.addEventListener('pointermove', onMove, { passive: true });
		frame = window.requestAnimationFrame(loop);

		return () => {
			window.removeEventListener('pointermove', onMove);
			window.cancelAnimationFrame(frame);
		};
	}, [pointerFine]);

	return (
		<>
			<motion.div
				className="snd-progress"
				style={{ scaleX: progress }}
			/>
			<div className="snd-grain" />
			{pointerFine ? (
				<div
					ref={lightRef}
					className="snd-cursor-light"
				/>
			) : null}
		</>
	);
}

export default Atmosphere;
