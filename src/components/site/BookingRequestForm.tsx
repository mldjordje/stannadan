'use client';

import { useState } from 'react';
import { Apartment } from '@/lib/stay/types';
import { calculateReservationTotal, formatCurrency, getNights } from '@/lib/stay/format';
import StayCalendar, { DateRange } from './StayCalendar';

type BookingRequestFormProps = {
	apartment: Apartment;
	blocked: string[];
};

const initialState = {
	guestName: '',
	guestEmail: '',
	guestPhone: '',
	guests: '2',
	notes: ''
};

/**
 * Direct booking request: pick the range on the live calendar, leave contact
 * details, the admin panel confirms. Posts to the same reservations endpoint.
 */
function BookingRequestForm({ apartment, blocked }: BookingRequestFormProps) {
	const [form, setForm] = useState(initialState);
	const [range, setRange] = useState<DateRange | null>(null);
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');

	const nights = range ? getNights(range.checkIn, range.checkOut) : 0;
	const stayTotal = range ? calculateReservationTotal(apartment, range.checkIn, range.checkOut) : 0;

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!range) {
			setStatus('error');
			setMessage('Izaberi datume u kalendaru.');

			return;
		}

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
					checkIn: range.checkIn,
					checkOut: range.checkOut,
					guests: Number(form.guests),
					totalPrice: stayTotal,
					source: 'direct',
					status: 'pending',
					notes: form.notes
				})
			});

			if (!response.ok) {
				throw new Error('Upit nije sačuvan. Pozovi nas telefonom.');
			}

			setStatus('success');
			setMessage('Upit je primljen. Potvrda termina stiže na email.');
			setForm(initialState);
			setRange(null);
		} catch (error) {
			setStatus('error');
			setMessage((error as Error).message);
		}
	}

	return (
		<div
			className="snd-panel"
			id="rezervacija"
		>
			<div className="snd-flex-between" style={{ marginBottom: 26 }}>
				<div>
					<span className="snd-eyebrow">Direktna rezervacija</span>
					<h3
						className="snd-serif"
						style={{ fontSize: 30, marginTop: 8, lineHeight: 1.1 }}
					>
						{apartment.name}
					</h3>
				</div>
				<div className="snd-price">
					<span className="amount">{formatCurrency(apartment.pricePerNight)}</span>
					<span className="per">/ noć</span>
				</div>
			</div>

			<StayCalendar
				blocked={blocked}
				pricePerNight={apartment.pricePerNight}
				onChange={setRange}
			/>

			<div
				className="snd-panel-plain"
				style={{ margin: '26px 0' }}
			>
				<div className="snd-kv">
					<span className="label">
						{nights > 0 ? `${formatCurrency(apartment.pricePerNight)} × ${nights} noćenja` : 'Noćenja'}
					</span>
					<span className="val">{nights > 0 ? formatCurrency(apartment.pricePerNight * nights) : '—'}</span>
				</div>
				<div className="snd-kv">
					<span className="label">Završno čišćenje</span>
					<span className="val">{formatCurrency(apartment.cleaningFee)}</span>
				</div>
				<div className="snd-kv is-total">
					<span className="label">Ukupno</span>
					<span className="val">{nights > 0 ? formatCurrency(stayTotal) : '—'}</span>
				</div>
			</div>

			<form
				className="snd-form-grid"
				onSubmit={handleSubmit}
			>
				<label className="snd-field">
					<span className="snd-label">Ime i prezime</span>
					<input
						className="snd-input"
						value={form.guestName}
						onChange={(event) => setForm((current) => ({ ...current, guestName: event.target.value }))}
						placeholder="Marko Marković"
						required
					/>
				</label>
				<label className="snd-field">
					<span className="snd-label">Email</span>
					<input
						className="snd-input"
						type="email"
						value={form.guestEmail}
						onChange={(event) => setForm((current) => ({ ...current, guestEmail: event.target.value }))}
						placeholder="ime@email.com"
						required
					/>
				</label>
				<label className="snd-field">
					<span className="snd-label">Telefon</span>
					<input
						className="snd-input"
						value={form.guestPhone}
						onChange={(event) => setForm((current) => ({ ...current, guestPhone: event.target.value }))}
						placeholder="+381 6x xxx xxxx"
						required
					/>
				</label>
				<label className="snd-field">
					<span className="snd-label">Broj gostiju</span>
					<input
						className="snd-input"
						type="number"
						min={1}
						max={apartment.guests}
						value={form.guests}
						onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))}
						required
					/>
				</label>
				<label className="snd-field is-full">
					<span className="snd-label">Napomena</span>
					<textarea
						className="snd-input"
						value={form.notes}
						onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
						placeholder="Vreme dolaska, parking, rani check-in…"
					/>
				</label>

				<div
					className="is-full snd-flex-between"
					style={{ alignItems: 'center' }}
				>
					<span className="snd-note">
						{range
							? `${range.checkIn} → ${range.checkOut}`
							: 'Termin biraš u kalendaru iznad.'}
					</span>
					<button
						type="submit"
						className="snd-btn snd-btn-solid"
						disabled={status === 'loading'}
					>
						<span>{status === 'loading' ? 'Šaljem…' : 'Pošalji upit'}</span>
						<span className="snd-arr" />
					</button>
				</div>

				{message ? (
					<p className={`is-full snd-note ${status === 'success' ? 'is-ok' : 'is-err'}`}>{message}</p>
				) : null}
			</form>
		</div>
	);
}

export default BookingRequestForm;
