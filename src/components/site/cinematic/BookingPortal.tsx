'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import type { ApartmentChapter } from '@/lib/site/types';
import styles from './BookingPortal.module.css';

type BookingPortalProps = {
	apartments: ApartmentChapter[];
	city: string;
};

export function BookingPortal({ apartments, city }: BookingPortalProps) {
	const router = useRouter();
	const [slug, setSlug] = useState(apartments[0]?.slug ?? '');
	const [arrival, setArrival] = useState('');
	const [departure, setDeparture] = useState('');
	const [guests, setGuests] = useState(1);
	const selectedApartment = useMemo(
		() => apartments.find((apartment) => apartment.slug === slug) ?? apartments[0],
		[apartments, slug]
	);

	if (apartments.length === 0) {
		return (
			<section
				className={styles.section}
				aria-labelledby="booking-title"
				data-cinematic-scene="Rezervacija"
			>
				<p className={styles.index}>07 / Rezervacija</p>
				<h2 id="booking-title">Izaberite svoj boravak.</h2>
				<Link
					className={styles.allApartments}
					href="/apartments"
				>
					Pogledaj apartmane
				</Link>
			</section>
		);
	}

	const handleApartmentChange = (nextSlug: string) => {
		const nextApartment = apartments.find((apartment) => apartment.slug === nextSlug);

		setSlug(nextSlug);

		if (nextApartment) {
			setGuests((current) => Math.min(current, nextApartment.guests));
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const query = new URLSearchParams({
			checkIn: arrival,
			checkOut: departure,
			guests: String(guests)
		});

		router.push(`/apartments/${slug}?${query.toString()}`);
	};

	return (
		<section
			className={styles.section}
			aria-labelledby="booking-title"
			data-cinematic-scene="Rezervacija"
		>
			<div className={styles.copy}>
				<p className={styles.index}>07 / Rezervacija</p>
				<h2 id="booking-title">Vaš dolazak u {city} počinje ovde.</h2>
				<p>Izaberite apartman i detalje boravka. Dostupnost proveravate na sledećem koraku.</p>
			</div>

			<form
				className={styles.form}
				onSubmit={handleSubmit}
			>
				<label>
					<span>Apartman</span>
					<select
						value={slug}
						onChange={(event) => handleApartmentChange(event.target.value)}
					>
						{apartments.map((apartment) => (
							<option
								key={apartment.id}
								value={apartment.slug}
							>
								{apartment.name}
							</option>
						))}
					</select>
				</label>

				<div className={styles.dates}>
					<label>
						<span>Dolazak</span>
						<input
							type="date"
							value={arrival}
							onChange={(event) => setArrival(event.target.value)}
							required
						/>
					</label>
					<label>
						<span>Odlazak</span>
						<input
							type="date"
							value={departure}
							min={arrival || undefined}
							onChange={(event) => setDeparture(event.target.value)}
							required
						/>
					</label>
				</div>

				<label>
					<span>Broj gostiju</span>
					<input
						type="number"
						min={1}
						max={selectedApartment?.guests ?? 1}
						value={guests}
						onChange={(event) => setGuests(Number(event.target.value))}
						required
					/>
				</label>

				<button type="submit">Proveri dostupnost</button>
			</form>
		</section>
	);
}
