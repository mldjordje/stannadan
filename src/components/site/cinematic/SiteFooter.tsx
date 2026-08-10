import Link from 'next/link';
import type { Apartment, PropertyProfile } from '@/lib/stay/types';
import styles from './SiteFooter.module.css';

type SiteFooterProps = {
	property: PropertyProfile;
	apartments: Pick<Apartment, 'id' | 'slug' | 'name'>[];
};

const publicNavigation = [
	{ href: '/', label: 'Početna' },
	{ href: '/apartments', label: 'Apartmani' },
	{ href: '/availability', label: 'Dostupnost' },
	{ href: '/contact', label: 'Kontakt' },
	{ href: '/account', label: 'Moj nalog' }
];

export function SiteFooter({ property, apartments }: SiteFooterProps) {
	return (
		<footer className={styles.footer}>
			<div className={styles.titleRow}>
				<p>{property.city}</p>
				<h2>{property.name}</h2>
			</div>

			<div className={styles.columns}>
				<div>
					<h3>Kontakt</h3>
					<address>
						<Link href={`tel:${property.phone}`}>{property.phone}</Link>
						<Link href={`mailto:${property.email}`}>{property.email}</Link>
						<Link
							href={property.googleMapsUrl}
							target="_blank"
							rel="noreferrer"
						>
							{property.address}
						</Link>
					</address>
				</div>

				<div>
					<h3>Apartmani</h3>
					<nav aria-label="Apartmani u podnožju">
						{apartments.map((apartment) => (
							<Link
								key={apartment.id}
								href={`/apartments/${apartment.slug}`}
							>
								{apartment.name}
							</Link>
						))}
					</nav>
				</div>

				<div>
					<h3>Navigacija</h3>
					<nav aria-label="Javna navigacija u podnožju">
						{publicNavigation.map((item) => (
							<Link
								key={item.href}
								href={item.href}
							>
								{item.label}
							</Link>
						))}
					</nav>
				</div>
			</div>

			<div className={styles.credits}>
				<p>
					© {new Date().getFullYear()} {property.name}
				</p>
				<p>
					{property.city}, {property.country}
				</p>
			</div>
		</footer>
	);
}
