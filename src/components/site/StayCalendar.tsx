'use client';

import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/stay/format';
import { IconChevron } from './Icons';

export type DateRange = {
	checkIn: string;
	checkOut: string;
};

type StayCalendarProps = {
	/** occupied day keys, YYYY-MM-DD */
	blocked: string[];
	pricePerNight: number;
	value?: Partial<DateRange>;
	onChange?: (range: DateRange | null) => void;
	compact?: boolean;
};

const MONTHS = [
	'Januar',
	'Februar',
	'Mart',
	'April',
	'Maj',
	'Jun',
	'Jul',
	'Avgust',
	'Septembar',
	'Oktobar',
	'Novembar',
	'Decembar'
];

const DOW = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];

function key(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fromKey(value: string) {
	const [year, month, day] = value.split('-').map(Number);

	return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
	const next = new Date(date);
	next.setDate(next.getDate() + amount);

	return next;
}

function nightsBetween(start: Date, end: Date) {
	return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function monthGrid(month: Date) {
	const first = new Date(month.getFullYear(), month.getMonth(), 1);
	const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
	const lead = (first.getDay() + 6) % 7;
	const cells: (Date | null)[] = Array.from({ length: lead }, () => null);

	for (let day = 1; day <= last.getDate(); day += 1) {
		cells.push(new Date(month.getFullYear(), month.getMonth(), day));
	}

	return cells;
}

/**
 * Two-month availability calendar driven by the same reservation data the
 * admin panel writes. Selecting a range is the primary booking gesture.
 */
function StayCalendar({ blocked, pricePerNight, value, onChange, compact = false }: StayCalendarProps) {
	const today = useMemo(() => {
		const now = new Date();

		return new Date(now.getFullYear(), now.getMonth(), now.getDate());
	}, []);

	const blockedSet = useMemo(() => new Set(blocked), [blocked]);
	const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
	const [start, setStart] = useState<Date | null>(value?.checkIn ? fromKey(value.checkIn) : null);
	const [end, setEnd] = useState<Date | null>(value?.checkOut ? fromKey(value.checkOut) : null);
	const [hover, setHover] = useState<Date | null>(null);

	const months = compact
		? [new Date(cursor)]
		: [new Date(cursor), new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)];

	function commit(nextStart: Date | null, nextEnd: Date | null) {
		setStart(nextStart);
		setEnd(nextEnd);

		if (onChange) {
			onChange(nextStart && nextEnd ? { checkIn: key(nextStart), checkOut: key(nextEnd) } : null);
		}
	}

	function select(date: Date) {
		if (!start || (start && end)) {
			commit(date, null);

			return;
		}

		if (date <= start) {
			commit(date, null);

			return;
		}

		const span = nightsBetween(start, date);

		for (let offset = 0; offset < span; offset += 1) {
			if (blockedSet.has(key(addDays(start, offset)))) {
				commit(date, null);

				return;
			}
		}

		commit(start, date);
	}

	const provisionalEnd = end ?? hover;
	const nights = start && end ? nightsBetween(start, end) : 0;

	function inRange(date: Date) {
		if (!start || !provisionalEnd || provisionalEnd <= start) {
			return false;
		}

		return date > start && date < provisionalEnd;
	}

	const rangeLabel = (() => {
		if (!start) {
			return 'Izaberi dolazak';
		}

		if (!end) {
			return `${start.getDate()}. ${MONTHS[start.getMonth()].toLowerCase()} — izaberi odlazak`;
		}

		return `${start.getDate()}. ${MONTHS[start.getMonth()].toLowerCase()} — ${end.getDate()}. ${MONTHS[
			end.getMonth()
		].toLowerCase()} ${end.getFullYear()}`;
	})();

	return (
		<div>
			<div className="snd-cal-head">
				<div>
					<span className="snd-eyebrow">Termini uživo</span>
					<span className="snd-cal-range">{rangeLabel}</span>
				</div>
				<div style={{ display: 'flex', gap: 8 }}>
					<button
						type="button"
						className="snd-icon-btn"
						aria-label="Prethodni mesec"
						onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
					>
						<IconChevron size={14} />
					</button>
					<button
						type="button"
						className="snd-icon-btn"
						aria-label="Sledeći mesec"
						onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
					>
						<IconChevron
							size={14}
							style={{ transform: 'rotate(180deg)' }}
						/>
					</button>
				</div>
			</div>

			<div className="snd-cal-months">
				{months.map((month) => (
					<div
						className="snd-cal-month"
						key={`${month.getFullYear()}-${month.getMonth()}`}
					>
						<span className="snd-cal-label">
							{MONTHS[month.getMonth()]}
							<span>{month.getFullYear()}</span>
						</span>
						<div className="snd-cal-dow">
							{DOW.map((day, dayIndex) => (
								<span key={`${day}-${dayIndex}`}>{day}</span>
							))}
						</div>
						<div className="snd-cal-grid">
							{monthGrid(month).map((date, cellIndex) => {
								if (!date) {
									return <span key={`empty-${cellIndex}`} />;
								}

								const dateKey = key(date);
								const isPast = date < today;
								const isBooked = blockedSet.has(dateKey);
								const isEdge =
									(start && key(start) === dateKey) || (end && key(end) === dateKey) || false;
								const classes = ['snd-cal-cell'];

								if (isBooked) {
									classes.push('is-booked');
								}

								if (inRange(date)) {
									classes.push('is-in');
								}

								if (isEdge) {
									classes.push('is-edge');
								}

								return (
									<button
										type="button"
										key={dateKey}
										className={classes.join(' ')}
										disabled={isPast || isBooked}
										onMouseEnter={() => setHover(date)}
										onMouseLeave={() => setHover(null)}
										onClick={() => select(date)}
									>
										<span>{date.getDate()}</span>
										{!isPast && !isBooked && !isEdge ? (
											<span className="p">{formatCurrency(pricePerNight)}</span>
										) : null}
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>

			<div className="snd-cal-legend">
				<span>
					<i style={{ background: 'var(--gold)' }} />
					Izabrano
				</span>
				<span>
					<i style={{ border: '1px solid var(--line-soft)' }} />
					Slobodno
				</span>
				<span>
					<i style={{ border: '1px dashed rgba(244,239,230,0.25)' }} />
					Zauzeto
				</span>
				{nights > 0 ? <span style={{ color: 'var(--gold)' }}>{nights} noćenja</span> : null}
			</div>
		</div>
	);
}

export default StayCalendar;
