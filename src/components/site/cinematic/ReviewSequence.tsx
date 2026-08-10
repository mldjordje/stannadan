'use client';

import { useRef, useState } from 'react';
import { useCinematicScene } from '@/components/site/motion/useCinematicScene';
import type { LandingPresentation } from '@/lib/site/types';
import styles from './ReviewSequence.module.css';

type ReviewSequenceProps = {
	trust: LandingPresentation['trust'];
};

export function ReviewSequence({ trust }: ReviewSequenceProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const [activeReview, setActiveReview] = useState(0);
	const activeReviewRef = useRef(0);

	useCinematicScene(
		sectionRef,
		({ gsap, ScrollTrigger, element, mode }) => {
			const reviews = gsap.utils.toArray<HTMLElement>('[data-review-fact]', element);

			if (mode === 'native') {
				reviews.forEach((review) => {
					gsap.from(review, {
						y: 28,
						opacity: 0,
						duration: 0.6,
						scrollTrigger: { trigger: review, start: 'top 84%', once: true }
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
					const nextReview = Math.min(trust.length - 1, Math.round(progress * Math.max(1, trust.length - 1)));

					if (nextReview !== activeReviewRef.current) {
						activeReviewRef.current = nextReview;
						setActiveReview(nextReview);
					}
				}
			});
		},
		[trust.length]
	);

	if (trust.length === 0) {
		return null;
	}

	return (
		<section
			ref={sectionRef}
			className={styles.section}
			aria-labelledby="reviews-title"
			data-cinematic-scene="Utisci"
		>
			<div className={styles.stage}>
				<header className={styles.heading}>
					<p>06 / Utisci</p>
					<h2 id="reviews-title">Poverenje, bez suvišnih reči.</h2>
				</header>

				<ol className={styles.reviews}>
					{trust.map((item, index) => (
						<li
							key={item.apartmentName}
							className={index === activeReview ? styles.active : undefined}
							data-review-fact
						>
							<p className={styles.rating}>{item.rating.toFixed(2)}</p>
							<div>
								<h3>{item.apartmentName}</h3>
								<p>{item.reviewCount} recenzija</p>
							</div>
						</li>
					))}
				</ol>

				<p className={styles.counter}>
					{String(activeReview + 1).padStart(2, '0')} / {String(trust.length).padStart(2, '0')}
				</p>
			</div>
		</section>
	);
}
