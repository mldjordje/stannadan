'use client';

import Image from 'next/image';
import { useRef, useState, type CSSProperties } from 'react';
import { useMotion } from '@/components/site/motion/MotionProvider';
import { useCinematicScene } from '@/components/site/motion/useCinematicScene';
import styles from './EditorialGallery.module.css';

type EditorialGalleryProps = {
	images: string[];
	name: string;
};

export function EditorialGallery({ images, name }: EditorialGalleryProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const { mode, ready } = useMotion();
	const [activeIndex, setActiveIndex] = useState(0);
	const activeIndexRef = useRef(0);

	useCinematicScene(
		sectionRef,
		({ ScrollTrigger, element }) => {
			ScrollTrigger.create({
				trigger: element,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				onUpdate: ({ progress }) => {
					const nextIndex = Math.min(
						images.length - 1,
						Math.round(progress * Math.max(1, images.length - 1))
					);

					if (nextIndex !== activeIndexRef.current) {
						activeIndexRef.current = nextIndex;
						setActiveIndex(nextIndex);
					}
				}
			});
		},
		[images.length]
	);

	if (images.length === 0) {
		return null;
	}

	function setCurrentIndex(index: number) {
		const nextIndex = Math.max(0, Math.min(images.length - 1, index));
		const track = trackRef.current;
		const target = track?.children.item(nextIndex) as HTMLElement | null;

		if (!track || !target) {
			return;
		}

		track.scrollTo({
			left: target.offsetLeft - track.offsetLeft,
			behavior: mode === 'static' ? 'auto' : 'smooth'
		});
		activeIndexRef.current = nextIndex;
		setActiveIndex(nextIndex);
	}

	function handleTrackScroll() {
		const track = trackRef.current;

		if (!track) {
			return;
		}

		const panels = Array.from(track.children) as HTMLElement[];
		const nextIndex = panels.reduce((closestIndex, panel, index) => {
			const closestDistance = Math.abs(panels[closestIndex].offsetLeft - track.scrollLeft);
			const currentDistance = Math.abs(panel.offsetLeft - track.scrollLeft);

			return currentDistance < closestDistance ? index : closestIndex;
		}, 0);

		if (nextIndex !== activeIndexRef.current) {
			activeIndexRef.current = nextIndex;
			setActiveIndex(nextIndex);
		}
	}

	return (
		<section
			ref={sectionRef}
			className={styles.section}
			aria-labelledby="gallery-title"
			data-gallery-enhanced={ready && mode !== 'static' ? 'true' : 'false'}
			style={{ '--gallery-count': images.length } as CSSProperties}
		>
			<div className={styles.stage}>
				<header className={styles.heading}>
					<p>Fotografije</p>
					<h2 id="gallery-title">Prostor, izbliza.</h2>
				</header>

				<div
					ref={trackRef}
					className={styles.track}
					onScroll={handleTrackScroll}
				>
					{images.map((image, index) => (
						<figure
							key={`${image}-${index}`}
							className={styles.frame}
							data-active={index === activeIndex ? 'true' : 'false'}
						>
							<Image
								className={styles.image}
								src={image}
								alt={`${name} — fotografija ${index + 1}`}
								fill
								sizes="(min-width: 64rem) 100vw, 88vw"
							/>
							<figcaption>
								{name} — fotografija {String(index + 1).padStart(2, '0')}
							</figcaption>
						</figure>
					))}
				</div>

				<div className={styles.controls}>
					<p
						aria-live="polite"
						aria-atomic="true"
					>
						Fotografija {activeIndex + 1} od {images.length}
					</p>
					<div>
						<button
							type="button"
							onClick={() => setCurrentIndex(activeIndex - 1)}
							disabled={activeIndex === 0}
							aria-label="Prethodna fotografija"
						>
							<svg
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M19 12H5m6 6-6-6 6-6" />
							</svg>
						</button>
						<button
							type="button"
							onClick={() => setCurrentIndex(activeIndex + 1)}
							disabled={activeIndex === images.length - 1}
							aria-label="Sledeća fotografija"
						>
							<svg
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path d="M5 12h14m-6-6 6 6-6 6" />
							</svg>
						</button>
					</div>
				</div>

				<p
					className={styles.desktopCaption}
					aria-live="polite"
				>
					<span>{String(activeIndex + 1).padStart(2, '0')}</span>
					{name} — fotografija {activeIndex + 1}
				</p>
			</div>
		</section>
	);
}
