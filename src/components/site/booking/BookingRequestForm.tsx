'use client';

import { useState } from 'react';
import AvailabilityRangeCalendar from '@/components/site/availability/AvailabilityRangeCalendar';
import { rangeIsAvailable, type PublicUnavailableRange } from '@/components/site/availability/calendar';
import { calculateReservationTotal, formatCurrency, getNights } from '@/lib/stay/format';
import type { Apartment } from '@/lib/stay/types';
import styles from './BookingRequestForm.module.css';

type Props = {
	apartment: Apartment;
	unavailableRanges: PublicUnavailableRange[];
	initialCheckIn?: string;
	initialCheckOut?: string;
};
const baseState = {
	guestName: '',
	guestEmail: '',
	guestPhone: '',
	guests: '2',
	notes: ''
};

export default function BookingRequestForm({
	apartment,
	unavailableRanges,
	initialCheckIn = '',
	initialCheckOut = ''
}: Props) {
	const validInitial = rangeIsAvailable(initialCheckIn, initialCheckOut, unavailableRanges);
	const [form, setForm] = useState({
		...baseState,
		checkIn: validInitial ? initialCheckIn : '',
		checkOut: validInitial ? initialCheckOut : ''
	});
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');
	const nights = form.checkIn && form.checkOut ? getNights(form.checkIn, form.checkOut) : 0;
	const total =
		nights > 0 ? calculateReservationTotal(apartment, form.checkIn, form.checkOut) : apartment.pricePerNight;
	const fieldId = (name: string) => `booking-${apartment.id}-${name}`;
	const minDate = new Date().toISOString().slice(0, 10);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setMessage('');

		if (!rangeIsAvailable(form.checkIn, form.checkOut, unavailableRanges)) {
			setStatus('error');
			setMessage('Izaberite slobodan datum dolaska i odlaska u kalendaru.');
			return;
		}

		setStatus('loading');
		try {
			const response = await fetch('/api/stay/reservations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					apartmentId: apartment.id,
					guestName: form.guestName,
					guestEmail: form.guestEmail,
					guestPhone: form.guestPhone,
					checkIn: form.checkIn,
					checkOut: form.checkOut,
					guests: Number(form.guests),
					totalPrice: total,
					source: 'direct',
					status: 'pending',
					notes: form.notes
				})
			});

			if (!response.ok) {
				const result = (await response.json().catch(() => null)) as {
					error?: string;
				} | null;
				throw new Error(
					response.status === 409
						? 'Termin je upravo zauzet. Izaberite drugi period.'
						: result?.error || 'Rezervacija nije sačuvana.'
				);
			}

			setStatus('success');
			setMessage('Upit je sačuvan. Domaćin će potvrditi termin i poslati detalje na email.');
			setForm({ ...baseState, checkIn: '', checkOut: '' });
		} catch (error) {
			setStatus('error');
			setMessage((error as Error).message);
		}
	}

	function update(key: keyof typeof form, value: string) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	return (
		<div className={styles.panel}>
			<header className={styles.header}>
				<div>
					<p className={styles.kicker}>Direktna rezervacija</p>
					<h3 className={styles.title}>{apartment.name}</h3>
				</div>
				<div className={styles.rate}>
					<p>{formatCurrency(apartment.pricePerNight)} / noć</p>
					<span>Čišćenje {formatCurrency(apartment.cleaningFee)}</span>
				</div>
			</header>
			<form
				className={styles.form}
				onSubmit={handleSubmit}
				aria-busy={status === 'loading'}
			>
				<div className={styles.calendarField}>
					<AvailabilityRangeCalendar
						ranges={unavailableRanges}
						checkIn={form.checkIn}
						checkOut={form.checkOut}
						onChange={(range) => setForm((current) => ({ ...current, ...range }))}
						label={`Izbor datuma za ${apartment.name}`}
					/>
				</div>
				<Field
					id={fieldId('guestName')}
					label="Ime i prezime"
					value={form.guestName}
					onChange={(value) => update('guestName', value)}
					placeholder="Vaše ime i prezime"
					required
				/>
				<Field
					id={fieldId('guestEmail')}
					label="Email"
					type="email"
					value={form.guestEmail}
					onChange={(value) => update('guestEmail', value)}
					placeholder="ime@primer.rs"
					required
				/>
				<Field
					id={fieldId('guestPhone')}
					label="Telefon"
					value={form.guestPhone}
					onChange={(value) => update('guestPhone', value)}
					placeholder="+381 60 000 0000"
					required
				/>
				<Field
					id={fieldId('guests')}
					label="Broj gostiju"
					type="number"
					min="1"
					max={String(apartment.guests)}
					value={form.guests}
					onChange={(value) => update('guests', value)}
					required
				/>
				<Field
					id={fieldId('checkIn')}
					label="Dolazak"
					type="date"
					min={minDate}
					value={form.checkIn}
					onChange={(value) => {
						update('checkIn', value);
						update('checkOut', '');
					}}
					required
				/>
				<Field
					id={fieldId('checkOut')}
					label="Odlazak"
					type="date"
					min={form.checkIn || minDate}
					value={form.checkOut}
					onChange={(value) => update('checkOut', value)}
					required
				/>
				<label className={`${styles.field} ${styles.fullWidth}`}>
					<span>Napomena</span>
					<textarea
						id={fieldId('notes')}
						value={form.notes}
						onChange={(event) => update('notes', event.target.value)}
						placeholder="Dolazak, parking ili posebna napomena"
					/>
				</label>
				<div className={styles.summary}>
					<div>
						<p>Procena ukupno: {formatCurrency(total)}</p>
						<span>{nights > 0 ? `${nights} noćenja` : 'Izaberite datume za obračun.'}</span>
					</div>
					<button
						type="submit"
						disabled={status === 'loading'}
					>
						{status === 'loading' ? 'Slanje…' : 'Pošalji upit'}
					</button>
				</div>
				<div
					className={styles.status}
					aria-live="polite"
					aria-atomic="true"
				>
					{message ? <p data-status={status}>{message}</p> : null}
				</div>
			</form>
		</div>
	);
}

function Field({
	id,
	label,
	value,
	onChange,
	type = 'text',
	placeholder,
	required,
	min,
	max
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
	placeholder?: string;
	required?: boolean;
	min?: string;
	max?: string;
}) {
	return (
		<label
			className={styles.field}
			htmlFor={id}
		>
			<span>{label}</span>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				required={required}
				min={min}
				max={max}
			/>
		</label>
	);
}
