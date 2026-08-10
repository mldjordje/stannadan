'use client';

import Link from 'next/link';
import { useRef, useState, type CSSProperties } from 'react';
import { useCinematicScene } from '@/components/site/motion/useCinematicScene';
import type { ApartmentChapter } from '@/lib/site/types';
import { formatCurrency } from '@/lib/stay/format';
import styles from './ApartmentChapters.module.css';

type ApartmentChaptersProps = {
	chapters: ApartmentChapter[];
	introduction: string;
};

export function ApartmentChapters({ chapters, introduction }: ApartmentChaptersProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const [activeChapter, setActiveChapter] = useState(0);
	const activeChapterRef = useRef(0);

	useCinematicScene(
		sectionRef,
		({ gsap, ScrollTrigger, element, mode }) => {
			const articles = gsap.utils.toArray<HTMLElement>('[data-apartment-chapter]', element);

			if (mode === 'native') {
				articles.forEach((article) => {
					gsap.from(article, {
						y: 36,
						opacity: 0,
						duration: 0.65,
						scrollTrigger: { trigger: article, start: 'top 86%', once: true }
					});
				});
				return;
			}

			ScrollTrigger.create({
				trigger: element,
				start: 'top top',
				end: 'bottom bottom',
				scrub: true,
				onUpdate: ({ progress }) => {
					const scaledProgress = progress * Math.max(1, chapters.length - 1);
					const nextChapter = Math.min(chapters.length - 1, Math.round(scaledProgress));

					if (nextChapter !== activeChapterRef.current) {
						activeChapterRef.current = nextChapter;
						setActiveChapter(nextChapter);
					}

					articles.forEach((article, index) => {
						const distance = index - scaledProgress;
						const media = article.querySelector<HTMLElement>('[data-chapter-media]');
						const copy = article.querySelector<HTMLElement>('[data-chapter-copy]');

						gsap.set(media, {
							xPercent: distance * 12,
							clipPath: `inset(0 ${Math.max(0, distance) * 24}% 0 ${Math.max(0, -distance) * 24}%)`
						});
						gsap.set(copy, { xPercent: distance * -9 });
					});
				}
			});
		},
		[chapters.length]
	);

	if (chapters.length === 0) {
		return null;
	}

	return (
		<section
			ref={sectionRef}
			className={styles.section}
			aria-labelledby="apartments-title"
			data-cinematic-scene="Apartmani"
			style={{ '--chapter-count': chapters.length } as CSSProperties}
		>
			<div className={styles.stage}>
				<header className={styles.heading}>
					<p>03 / Apartmani</p>
					<h2 id="apartments-title">Svaki boravak ima svoj ritam.</h2>
					<span>{introduction}</span>
				</header>

				<ol className={styles.chapterList}>
					{chapters.map((chapter, index) => (
						<li
							key={chapter.id}
							className={index === activeChapter ? styles.activeChapter : undefined}
						>
							<article
								className={styles.chapter}
								data-apartment-chapter
							>
								<div
									className={styles.imageFrame}
									data-chapter-media
								>
									<picture>
										<source
											media="(max-width: 767px)"
											srcSet={chapter.mobileImage}
										/>
										<img
											src={chapter.desktopImage}
											alt={`Enterijer apartmana ${chapter.name}`}
											width={1600}
											height={1200}
											loading="lazy"
											decoding="async"
										/>
									</picture>
									<span className={styles.imageNumber}>{String(index + 1).padStart(2, '0')}</span>
								</div>

								<div
									className={styles.copy}
									data-chapter-copy
								>
									<p className={styles.location}>{chapter.location}</p>
									<h3>{chapter.name}</h3>
									<p className={styles.statement}>{chapter.statement}</p>
									<dl className={styles.facts}>
										<div>
											<dt>Noćenje</dt>
											<dd>{formatCurrency(chapter.pricePerNight)}</dd>
										</div>
										<div>
											<dt>Gosti</dt>
											<dd>{chapter.guests}</dd>
										</div>
										<div>
											<dt>Prostor</dt>
											<dd>{chapter.size} m²</dd>
										</div>
										<div>
											<dt>Ocena</dt>
											<dd>
												{chapter.rating.toFixed(2)} / {chapter.reviewCount} recenzija
											</dd>
										</div>
									</dl>
									<Link
										className={styles.detailLink}
										href={`/apartments/${chapter.slug}`}
									>
										Pogledaj apartman
										<svg
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path d="M5 12h14M13 6l6 6-6 6" />
										</svg>
									</Link>
								</div>
							</article>
						</li>
					))}
				</ol>

				<p className={styles.counter}>
					{String(activeChapter + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}
				</p>
			</div>
		</section>
	);
}
