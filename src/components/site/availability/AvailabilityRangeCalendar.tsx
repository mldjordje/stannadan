'use client';

import { useMemo, useState } from 'react';
import {
	buildCalendarCells,
	dateIsUnavailable,
	rangeIsAvailable,
	todayIso,
	type PublicUnavailableRange
} from './calendar';
import styles from './AvailabilityRangeCalendar.module.css';

type Props = {
	ranges: PublicUnavailableRange[];
	checkIn: string;
	checkOut: string;
	onChange: (range: { checkIn: string; checkOut: string }) => void;
	label?: string;
	tone?: 'light' | 'dark';
};
const weekdays = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];

export default function AvailabilityRangeCalendar({
	ranges,
	checkIn,
	checkOut,
	onChange,
	label = 'Izaberite datume',
	tone = 'light'
}: Props) {
	const initialDate = checkIn ? new Date(`${checkIn}T12:00:00`) : new Date();
	const [month, setMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
	const [anchor, setAnchor] = useState<string | null>(null);
	const [message, setMessage] = useState(
		checkIn && checkOut ? `Izabrano: ${checkIn} — ${checkOut}` : 'Prvo izaberite dolazak, zatim odlazak.'
	);
	const cells = useMemo(() => buildCalendarCells(month), [month]);
	const monthLabel = new Intl.DateTimeFormat('sr-Latn-RS', {
		month: 'long',
		year: 'numeric'
	}).format(month);
	const today = todayIso();

	function select(iso: string, unavailable: boolean, inMonth: boolean) {
		if (!inMonth || unavailable || iso < today) return;

		if (!anchor) {
			setAnchor(iso);
			onChange({ checkIn: iso, checkOut: '' });
			setMessage('Dolazak je izabran. Sada izaberite datum odlaska.');
			return;
		}

		if (iso <= anchor) {
			setAnchor(iso);
			onChange({ checkIn: iso, checkOut: '' });
			setMessage('Pomerili ste dolazak. Sada izaberite datum odlaska.');
			return;
		}

		if (!rangeIsAvailable(anchor, iso, ranges)) {
			setMessage('Taj period prelazi preko zauzetih dana. Izaberite drugi odlazak.');
			return;
		}

		onChange({ checkIn: anchor, checkOut: iso });
		setAnchor(null);
		setMessage(`Izabrano: ${anchor} — ${iso}`);
	}

	return (
		<section
			className={styles.calendar}
			data-tone={tone}
			aria-label={label}
		>
			<div className={styles.nav}>
				<button
					type="button"
					onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
					aria-label="Prethodni mesec"
				>
					←
				</button>
				<strong aria-live="polite">{monthLabel}</strong>
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
				{weekdays.map((day) => (
					<span key={day}>{day}</span>
				))}
			</div>
			<div
				className={styles.grid}
				role="grid"
				aria-label={`Dostupnost za ${monthLabel}`}
			>
				{cells.map((cell) => {
					const unavailable = dateIsUnavailable(cell.iso, ranges);
					const disabled = !cell.inCurrentMonth || unavailable || cell.iso < today;
					const start = cell.iso === (anchor ?? checkIn);
					const end = !anchor && Boolean(checkOut) && cell.iso === checkOut;
					const inRange = Boolean(checkIn && checkOut && cell.iso > checkIn && cell.iso < checkOut);
					return (
						<button
							key={cell.iso}
							type="button"
							role="gridcell"
							disabled={disabled}
							className={styles.day}
							data-outside={!cell.inCurrentMonth || undefined}
							data-unavailable={unavailable || undefined}
							data-start={start || undefined}
							data-end={end || undefined}
							data-range={inRange || undefined}
							data-today={cell.iso === today || undefined}
							onClick={() => select(cell.iso, unavailable, cell.inCurrentMonth)}
							aria-label={`${cell.iso}, ${unavailable ? 'zauzeto' : disabled ? 'nije dostupno' : 'slobodno'}`}
						>
							<span>{cell.date.getDate()}</span>
						</button>
					);
				})}
			</div>
			<p
				className={styles.message}
				data-error={message.includes('zauzetih') || undefined}
				aria-live="polite"
			>
				{message}
			</p>
			<div className={styles.legend}>
				<span>
					<i />
					Slobodno
				</span>
				<span>
					<i data-state="selected" />
					Izabrano
				</span>
				<span>
					<i data-state="busy" />
					Zauzeto
				</span>
			</div>
		</section>
	);
}
