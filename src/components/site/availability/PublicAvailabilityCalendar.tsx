'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AvailabilityRangeCalendar from './AvailabilityRangeCalendar';
import type { PublicApartmentOption, PublicUnavailableRange } from './calendar';
import styles from './PublicAvailabilityCalendar.module.css';

type Props = {
	apartments: PublicApartmentOption[];
	unavailableRanges: PublicUnavailableRange[];
};

export default function PublicAvailabilityCalendar({ apartments, unavailableRanges }: Props) {
	const [apartmentId, setApartmentId] = useState(apartments[0]?.id ?? '');
	const [selection, setSelection] = useState({ checkIn: '', checkOut: '' });
	const apartment = apartments.find((item) => item.id === apartmentId);
	const ranges = useMemo(
		() => unavailableRanges.filter((range) => range.apartmentId === apartmentId),
		[apartmentId, unavailableRanges]
	);

	if (!apartments.length)
		return <p className={styles.empty}>Kalendar će biti dostupan kada apartmani budu objavljeni.</p>;

	const href =
		apartment?.slug && selection.checkIn && selection.checkOut
			? `/apartments/${apartment.slug}?checkIn=${selection.checkIn}&checkOut=${selection.checkOut}#booking`
			: '';

	return (
		<section
			className={styles.calendar}
			aria-labelledby="availability-calendar-title"
		>
			<header className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Kalendar zauzetosti</p>
					<h2 id="availability-calendar-title">Pronađite slobodan period.</h2>
				</div>
				<label className={styles.apartmentSelect}>
					<span>Apartman</span>
					<select
						value={apartmentId}
						onChange={(event) => {
							setApartmentId(event.target.value);
							setSelection({ checkIn: '', checkOut: '' });
						}}
					>
						{apartments.map((item) => (
							<option
								key={item.id}
								value={item.id}
							>
								{item.name}
							</option>
						))}
					</select>
				</label>
			</header>
			<div className={styles.calendarFrame}>
				<AvailabilityRangeCalendar
					ranges={ranges}
					checkIn={selection.checkIn}
					checkOut={selection.checkOut}
					onChange={setSelection}
					tone="dark"
					label={`Dostupnost za ${apartment?.name ?? 'apartman'}`}
				/>
			</div>
			<div className={styles.continue}>
				<div>
					<span>Izabrani termin</span>
					<strong>
						{selection.checkIn && selection.checkOut
							? `${selection.checkIn} — ${selection.checkOut}`
							: 'Izaberite dolazak i odlazak'}
					</strong>
				</div>
				{href ? (
					<Link href={href}>Nastavi na rezervaciju →</Link>
				) : (
					<span className={styles.disabled}>Nastavi na rezervaciju</span>
				)}
			</div>
		</section>
	);
}
