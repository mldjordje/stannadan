'use client';

import { useRef } from 'react';
import { useCinematicScene } from '@/components/site/motion/useCinematicScene';
import type { ApartmentChapter, LandingPresentation } from '@/lib/site/types';
import styles from './MaterialDetails.module.css';

type MaterialDetailsProps = {
	facts: LandingPresentation['materialFacts'];
	chapters: ApartmentChapter[];
};

export function MaterialDetails({ facts, chapters }: MaterialDetailsProps) {
	const sectionRef = useRef<HTMLElement>(null);

	useCinematicScene(
		sectionRef,
		({ gsap, element, mode }) => {
			const details = gsap.utils.toArray<HTMLElement>('[data-material-detail]', element);

			details.forEach((detail, index) => {
				const media = detail.querySelector<HTMLElement>('[data-material-media]');
				const copy = detail.querySelector<HTMLElement>('[data-material-copy]');

				gsap.from(media, {
					yPercent: mode === 'cinematic' ? (index % 2 === 0 ? 10 : -10) : 5,
					clipPath: 'inset(12% 0 12% 0)',
					ease: 'none',
					scrollTrigger: {
						trigger: detail,
						start: 'top bottom',
						end: 'bottom top',
						scrub: mode === 'cinematic'
					}
				});
				gsap.from(copy, {
					y: 30,
					opacity: 0,
					duration: 0.7,
					scrollTrigger: { trigger: detail, start: 'top 78%', once: true }
				});
			});
		},
		[facts.length, chapters.length]
	);

	if (facts.length === 0 || chapters.length === 0) {
		return null;
	}

	return (
		<section
			ref={sectionRef}
			className={styles.section}
			aria-labelledby="materials-title"
			data-cinematic-scene="Detalji"
		>
			<header className={styles.heading}>
				<p>04 / Detalji</p>
				<h2 id="materials-title">Prostor se pamti po osećaju.</h2>
			</header>

			<ol className={styles.details}>
				{facts.map((fact, index) => {
					const chapter = chapters[index % chapters.length];

					return (
						<li
							key={`${fact.label}-${fact.value}`}
							className={styles.detail}
							data-material-detail
						>
							<figure
								className={styles.media}
								data-material-media
							>
								<picture>
									<source
										media="(max-width: 767px)"
										srcSet={chapter.mobileImage}
									/>
									<img
										src={chapter.desktopImage}
										alt={`Detalj enterijera ${chapter.name}`}
										width={1600}
										height={1200}
										loading="lazy"
										decoding="async"
									/>
								</picture>
								<figcaption>{chapter.name}</figcaption>
							</figure>

							<div
								className={styles.fact}
								data-material-copy
							>
								<span>{String(index + 1).padStart(2, '0')}</span>
								<p>{fact.value}</p>
								<h3>{fact.label}</h3>
							</div>
						</li>
					);
				})}
			</ol>
		</section>
	);
}
