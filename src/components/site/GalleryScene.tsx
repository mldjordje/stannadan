'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { IconChevron, IconClose } from './Icons';

export type Plate = {
	src: string;
	label: string;
	position?: string;
};

type GallerySceneProps = {
	plates: Plate[];
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

function GalleryScene({ plates }: GallerySceneProps) {
	const [index, setIndex] = useState(-1);
	const open = index >= 0;

	const step = useCallback(
		(direction: number) => {
			setIndex((current) => (current + direction + plates.length) % plates.length);
		},
		[plates.length]
	);

	useEffect(() => {
		if (!open) {
			return undefined;
		}

		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				setIndex(-1);
			}

			if (event.key === 'ArrowRight') {
				step(1);
			}

			if (event.key === 'ArrowLeft') {
				step(-1);
			}
		}

		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKey);

		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', onKey);
		};
	}, [open, step]);

	return (
		<>
			<div className="snd-mosaic">
				{plates.map((plate, plateIndex) => (
					<motion.button
						type="button"
						key={plate.src + plate.label}
						className={`snd-tile t${plateIndex + 1}`}
						onClick={() => setIndex(plateIndex)}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.2 }}
						transition={{ duration: 0.9, delay: plateIndex * 0.07, ease: EASE }}
					>
						<Image
							src={plate.src}
							alt={plate.label}
							fill
							sizes="(max-width: 900px) 100vw, 40vw"
							style={{ objectFit: 'cover', objectPosition: plate.position ?? '50% 50%' }}
						/>
						<span className="cap">
							<span className="label">{plate.label}</span>
							<span className="idx">{String(plateIndex + 1).padStart(2, '0')}</span>
						</span>
					</motion.button>
				))}
			</div>

			<AnimatePresence>
				{open ? (
					<motion.div
						className="snd-lightbox"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.35 }}
						onClick={() => setIndex(-1)}
					>
						<div className="snd-lightbox-head">
							<span className="snd-eyebrow">
								Plate {String(index + 1).padStart(2, '0')} / {String(plates.length).padStart(2, '0')}
							</span>
							<button
								type="button"
								className="snd-icon-btn"
								onClick={() => setIndex(-1)}
								aria-label="Zatvori"
							>
								<IconClose size={18} />
							</button>
						</div>

						<div
							className="snd-lightbox-stage"
							onClick={(event) => event.stopPropagation()}
						>
							<AnimatePresence mode="wait">
								<motion.img
									key={plates[index].src + index}
									src={plates[index].src}
									alt={plates[index].label}
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 1.01 }}
									transition={{ duration: 0.5, ease: EASE }}
								/>
							</AnimatePresence>
						</div>

						<div
							className="snd-lightbox-foot"
							onClick={(event) => event.stopPropagation()}
						>
							<button
								type="button"
								className="snd-tlink"
								onClick={() => step(-1)}
							>
								<IconChevron size={14} />
								<span>Nazad</span>
							</button>
							<span className="snd-it" style={{ fontSize: 22 }}>
								{plates[index].label}
							</span>
							<button
								type="button"
								className="snd-tlink"
								onClick={() => step(1)}
							>
								<span>Dalje</span>
								<span className="snd-arr" />
							</button>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</>
	);
}

export default GalleryScene;
