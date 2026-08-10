'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useCinematicScene } from '@/components/site/motion/useCinematicScene';
import { formatCurrency } from '@/lib/stay/format';
import type { Apartment } from '@/lib/stay/types';
import styles from './EditorialApartmentIndex.module.css';

type EditorialApartmentIndexProps = {
	apartments: Apartment[];
};

export function EditorialApartmentIndex({ apartments }: EditorialApartmentIndexProps) {
	const sectionRef = useRef<HTMLElement>(null);

	useCinematicScene(
		sectionRef,
		({ gsap, element }) => {
			const entries = gsap.utils.toArray<HTMLElement>('[data-apartment-entry]', element);

			gsap.from(entries, {
				y: 32,
				opacity: 0,
				duration: 0.7,
				stagger: 0.1,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: element,
					start: 'top 84%',
					once: true
				}
			});
		},
		[apartments.length]
	);

	if (apartments.length === 0) {
		return null;
	}

	return (
		<section
			ref={sectionRef}
			className={styles.section}
			aria-label="Apartmani u ponudi"
			data-cinematic-scene="Kolekcija apartmana"
		>
			<div className={styles.list}>
				{apartments.map((apartment, index) => (
					<article
						key={apartment.id}
						className={styles.apartment}
						data-apartment-entry
					>
						<p
							className={styles.number}
							aria-hidden="true"
						>
							{String(index + 1).padStart(2, '0')}
						</p>

						<div className={styles.media}>
							<Image
								className={styles.image}
								src={apartment.coverImage}
								alt={`${apartment.name} — glavni prostor`}
								fill
								priority={index === 0}
								sizes="(min-width: 64rem) 58vw, 100vw"
							/>
						</div>

						<div className={styles.copy}>
							<p className={styles.location}>{apartment.locationNote}</p>
							<h2>{apartment.name}</h2>
							<p className={styles.teaser}>{apartment.teaser}</p>

							<dl className={styles.facts}>
								<div>
									<dt>Noćenje od</dt>
									<dd>{formatCurrency(apartment.pricePerNight)}</dd>
								</div>
								<div>
									<dt>Gosti</dt>
									<dd>{apartment.guests}</dd>
								</div>
								<div>
									<dt>Prostor</dt>
									<dd>{apartment.size} m²</dd>
								</div>
								<div>
									<dt>Kreveti / kupatila</dt>
									<dd>
										{apartment.beds} / {apartment.baths}
									</dd>
								</div>
							</dl>

							<p className={styles.rating}>
								<span>{apartment.rating.toFixed(2)} / 5</span>
								{apartment.reviewCount} utisaka gostiju
							</p>

							<Link
								className={styles.link}
								href={`/apartments/${apartment.slug}`}
							>
								Detalji i rezervacija
								<svg
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							</Link>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
