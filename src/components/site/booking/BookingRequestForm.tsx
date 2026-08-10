'use client';

import { useState } from 'react';
import { calculateReservationTotal, formatCurrency, getNights } from '@/lib/stay/format';
import type { Apartment } from '@/lib/stay/types';
import styles from './BookingRequestForm.module.css';

type BookingRequestFormProps = {
	apartment: Apartment;
};

const initialState = {
	guestName: '',
	guestEmail: '',
	guestPhone: '',
	checkIn: '',
	checkOut: '',
	guests: '2',
	notes: ''
};

function BookingRequestForm({ apartment }: BookingRequestFormProps) {
	const [form, setForm] = useState(initialState);
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');

	const nights = form.checkIn && form.checkOut ? getNights(form.checkIn, form.checkOut) : 0;
	const total =
		nights > 0 ? calculateReservationTotal(apartment, form.checkIn, form.checkOut) : apartment.pricePerNight;
	const fieldId = (name: string) => `booking-${apartment.id}-${name}`;

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setStatus('loading');
		setMessage('');

		try {
			const response = await fetch('/api/stay/reservations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
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
				throw new Error('Rezervacija nije sačuvana.');
			}

			setStatus('success');
			setMessage('Upit je sačuvan. Domaćin će potvrditi termin i poslati detalje na email.');
			setForm(initialState);
		} catch (error) {
			setStatus('error');
			setMessage((error as Error).message);
		}
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
				<div className={styles.field}>
					<label htmlFor={fieldId('guestName')}>Ime i prezime</label>
					<input
						id={fieldId('guestName')}
						value={form.guestName}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								guestName: event.target.value
							}))
						}
						placeholder="Vaše ime i prezime"
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={fieldId('guestEmail')}>Email</label>
					<input
						id={fieldId('guestEmail')}
						type="email"
						value={form.guestEmail}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								guestEmail: event.target.value
							}))
						}
						placeholder="ime@primer.rs"
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={fieldId('guestPhone')}>Telefon</label>
					<input
						id={fieldId('guestPhone')}
						value={form.guestPhone}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								guestPhone: event.target.value
							}))
						}
						placeholder="+381 60 000 0000"
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={fieldId('guests')}>Broj gostiju</label>
					<input
						id={fieldId('guests')}
						type="number"
						min={1}
						max={apartment.guests}
						value={form.guests}
						onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))}
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={fieldId('checkIn')}>Dolazak</label>
					<input
						id={fieldId('checkIn')}
						type="date"
						value={form.checkIn}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								checkIn: event.target.value
							}))
						}
						required
					/>
				</div>

				<div className={styles.field}>
					<label htmlFor={fieldId('checkOut')}>Odlazak</label>
					<input
						id={fieldId('checkOut')}
						type="date"
						value={form.checkOut}
						onChange={(event) =>
							setForm((current) => ({
								...current,
								checkOut: event.target.value
							}))
						}
						required
					/>
				</div>

				<div className={`${styles.field} ${styles.fullWidth}`}>
					<label htmlFor={fieldId('notes')}>Napomena</label>
					<textarea
						id={fieldId('notes')}
						value={form.notes}
						onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
						placeholder="Dolazak, parking ili posebna napomena"
					/>
				</div>

				<div className={styles.summary}>
					<div>
						<p>Procena ukupno: {formatCurrency(total)}</p>
						<span>{nights > 0 ? `${nights} noćenja` : 'Izaberite datume za obračun.'}</span>
					</div>
					<button
						type="submit"
						disabled={status === 'loading'}
					>
						{status === 'loading' ? 'Slanje...' : 'Pošalji upit'}
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

export default BookingRequestForm;
