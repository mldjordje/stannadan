'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, type CSSProperties, type SyntheticEvent } from 'react';
import { useCinematicScene } from '@/components/site/motion/useCinematicScene';
import { cinematicMedia } from '@/lib/site/media';
import type { LandingPresentation } from '@/lib/site/types';
import { HeroTransitionCanvas } from './HeroTransitionCanvas';
import styles from './HeroSequence.module.css';

type HeroSequenceProps = {
	presentation: LandingPresentation;
	country: string;
};

export function HeroSequence({ presentation, country }: HeroSequenceProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const arrivalCompleteRef = useRef(false);
	const firstChapter = presentation.chapters[0];
	const transitionImage =
		firstChapter && firstChapter.desktopImage !== cinematicMedia.hero.desktop
			? firstChapter.desktopImage
			: cinematicMedia.living.desktop;

	const announceArrivalComplete = useCallback(() => {
		if (arrivalCompleteRef.current) {
			return;
		}

		arrivalCompleteRef.current = true;
		window.dispatchEvent(new Event('site:arrival-complete'));
	}, []);

	useCinematicScene(
		sectionRef,
		({ gsap, ScrollTrigger, element, mode }) => {
			if (mode !== 'cinematic') {
				return;
			}

			const image = element.querySelector<HTMLElement>('[data-hero-image]');
			const title = element.querySelector<HTMLElement>('[data-hero-title]');
			const apartment = element.querySelector<HTMLElement>('[data-hero-apartment]');

			gsap.set(image, { scale: 1.08 });
			gsap.set(apartment, { clipPath: 'inset(0 100% 0 0)', xPercent: 8 });
			gsap.timeline({
				defaults: { ease: 'none' },
				scrollTrigger: {
					trigger: element,
					start: 'top top',
					end: 'bottom bottom',
					scrub: true,
					onUpdate: ({ progress }) => {
						element.style.setProperty('--hero-progress', String(progress));
						element.style.setProperty('--hero-wipe', `${Math.max(0, 100 - progress * 100)}%`);

						if (progress >= 0.48) {
							announceArrivalComplete();
						}
					}
				}
			})
				.to(image, { scale: 1, yPercent: -8 }, 0)
				.to(title, { yPercent: -12, opacity: 0.18 }, 0.32)
				.to(apartment, { clipPath: 'inset(0 0% 0 0)', xPercent: 0 }, 0.45);

			ScrollTrigger.refresh();
		},
		[announceArrivalComplete]
	);

	useEffect(() => {
		const element = sectionRef.current;

		if (!element) {
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
					announceArrivalComplete();
				}
			},
			{ threshold: 0.08 }
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, [announceArrivalComplete]);

	const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
		const image = event.currentTarget;

		if (image.dataset.fallbackApplied === 'true') {
			return;
		}

		image.dataset.fallbackApplied = 'true';
		image.src = cinematicMedia.living.desktop;
	};

	return (
		<section
			ref={sectionRef}
			className={styles.sequence}
			aria-labelledby="arrival-title"
			data-cinematic-scene="Dolazak"
			data-hero-sequence
			style={{ '--hero-progress': 0, '--hero-wipe': '100%' } as CSSProperties}
		>
			<div className={styles.stage}>
				<div
					className={styles.media}
					data-hero-image
				>
					<picture>
						<source
							media="(max-width: 767px)"
							srcSet={cinematicMedia.hero.mobile}
						/>
						<img
							src={cinematicMedia.hero.desktop}
							alt={cinematicMedia.hero.alt}
							width={cinematicMedia.hero.width}
							height={cinematicMedia.hero.height}
							fetchPriority="high"
							decoding="async"
							onError={handleImageError}
						/>
					</picture>
					<div className={styles.fallbackTransition}>
						<img
							src={transitionImage}
							alt=""
							width={cinematicMedia.living.width}
							height={cinematicMedia.living.height}
							loading="eager"
							decoding="async"
						/>
					</div>
					<HeroTransitionCanvas
						from={cinematicMedia.hero.desktop}
						to={transitionImage}
					/>
				</div>

				<div className={styles.copy}>
					<p className={styles.location}>
						{presentation.city} <span aria-hidden="true">—</span> {country}
					</p>
					<h1
						id="arrival-title"
						className={styles.title}
						data-hero-title
					>
						{presentation.propertyName}
					</h1>
					<p className={styles.arrival}>{presentation.arrivalLine}</p>
				</div>

				<p className={styles.scrollCue}>
					<span aria-hidden="true" />
					Scroll to enter
				</p>

				{firstChapter ? (
					<div
						className={styles.apartmentReveal}
						data-hero-apartment
					>
						<span>01</span>
						<Link href={`/apartments/${firstChapter.slug}`}>{firstChapter.name}</Link>
					</div>
				) : null}
			</div>
		</section>
	);
}
