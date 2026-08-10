'use client';

import { useMemo, useState } from 'react';
import {
	buildCalendarCells,
	dateIsUnavailable,
	type PublicApartmentOption,
	type PublicUnavailableRange
} from './calendar';
import styles from './PublicAvailabilityCalendar.module.css';

type Props = {
	apartments: PublicApartmentOption[];
	unavailableRanges: PublicUnavailableRange[];
};
const weekdays = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

export default function PublicAvailabilityCalendar({ apartments, unavailableRanges }: Props) {
	const [apartmentId, setApartmentId] = useState(apartments[0]?.id ?? '');
	const [month, setMonth] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const cells = useMemo(() => buildCalendarCells(month), [month]);
	const ranges = useMemo(
		() => unavailableRanges.filter((range) => range.apartmentId === apartmentId),
		[apartmentId, unavailableRanges]
	);
	const monthLabel = new Intl.DateTimeFormat('sr-Latn-RS', {
		month: 'long',
		year: 'numeric'
	}).format(month);

	if (!apartments.length)
		return <p className={styles.empty}>Kalendar će biti dostupan kada apartmani budu objavljeni.</p>;

	return (
		<section
			className={styles.calendar}
			aria-labelledby="availability-calendar-title"
		>
			<header className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Kalendar zauzetosti</p>
					<h2 id="availability-calendar-title">Izaberite slobodan period.</h2>
				</div>
				<label className={styles.apartmentSelect}>
					<span>Apartman</span>
					<select
						value={apartmentId}
						onChange={(event) => setApartmentId(event.target.value)}
					>
						{apartments.map((apartment) => (
							<option
								key={apartment.id}
								value={apartment.id}
							>
								{apartment.name}
							</option>
						))}
					</select>
				</label>
			</header>

			<div className={styles.monthNavigation}>
				<button
					type="button"
					onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
					aria-label="Prethodni mesec"
				>
					←
				</button>
				<p aria-live="polite">{monthLabel}</p>
				<button
					type="button"
					onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
					aria-label="Sledeći mesec"
				>
					→
				</button>
			</div>
			<div
				className={styles.weekdays}
				aria-hidden="true"
			>
				{weekdays.map((label) => (
					<span key={label}>{label}</span>
				))}
			</div>
			<div
				className={styles.grid}
				role="list"
				aria-label={`Dostupnost za ${monthLabel}`}
			>
				{cells.map((cell) => {
					const unavailable = dateIsUnavailable(cell.iso, ranges);
					const dateLabel = new Intl.DateTimeFormat('sr-Latn-RS', {
						weekday: 'long',
						day: 'numeric',
						month: 'long'
					}).format(cell.date);
					return (
						<div
							key={cell.iso}
							className={styles.day}
							data-outside={!cell.inCurrentMonth || undefined}
							data-unavailable={unavailable || undefined}
							role="listitem"
							aria-label={`${dateLabel}, ${unavailable ? 'zauzeto' : 'slobodno'}`}
						>
							<span className={styles.dayNumber}>{cell.date.getDate()}</span>
							{unavailable && cell.inCurrentMonth ? <span className={styles.status}>Zauzeto</span> : null}
						</div>
					);
				})}
			</div>
			<footer className={styles.legend}>
				<span>
					<i data-state="free" /> Slobodno
				</span>
				<span>
					<i data-state="unavailable" /> Zauzeto
				</span>
			</footer>
		</section>
	);
}
