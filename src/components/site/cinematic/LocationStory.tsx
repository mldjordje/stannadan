import Link from 'next/link';
import type { LandingPresentation } from '@/lib/site/types';
import type { PropertyProfile } from '@/lib/stay/types';
import styles from './LocationStory.module.css';

type LocationStoryProps = {
	property: Pick<PropertyProfile, 'city' | 'country' | 'address' | 'phone' | 'email' | 'googleMapsUrl'>;
	neighborhood: LandingPresentation['neighborhood'];
	image: { mobile: string; desktop: string; alt: string };
};

export function LocationStory({ property, neighborhood, image }: LocationStoryProps) {
	return (
		<section
			className={styles.section}
			aria-labelledby="location-title"
			data-cinematic-scene="Lokacija"
		>
			<div className={styles.topline}>
				<p>05 / Lokacija</p>
				<p>{property.address}</p>
			</div>

			<div className={styles.story}>
				<div className={styles.copy}>
					<h2 id="location-title">
						{property.city}, <em>{property.country}</em>
					</h2>
					<ul>
						{neighborhood.map((place) => (
							<li key={`${place.label}-${place.distance}`}>
								<span>{place.label}</span>
								<span>{place.distance}</span>
							</li>
						))}
					</ul>
				</div>

				<figure className={styles.media}>
					<picture>
						<source
							media="(max-width: 767px)"
							srcSet={image.mobile}
						/>
						<img
							src={image.desktop}
							alt={image.alt}
							width={1600}
							height={1200}
							loading="lazy"
							decoding="async"
						/>
					</picture>
					<svg
						className={styles.route}
						viewBox="0 0 500 300"
						aria-hidden="true"
					>
						<path d="M15 248C96 195 92 92 180 104c69 9 65 87 138 73 57-11 71-96 168-151" />
						<circle
							cx="15"
							cy="248"
							r="5"
						/>
						<circle
							cx="486"
							cy="26"
							r="5"
						/>
					</svg>
				</figure>
			</div>

			<div className={styles.contact}>
				<Link href={`tel:${property.phone}`}>{property.phone}</Link>
				<Link href={`mailto:${property.email}`}>{property.email}</Link>
				<Link
					href={property.googleMapsUrl}
					target="_blank"
					rel="noreferrer"
				>
					Otvori lokaciju
				</Link>
			</div>
		</section>
	);
}
