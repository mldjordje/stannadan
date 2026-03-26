'use client';

import { useState } from 'react';
import { Apartment } from '@/lib/stay/types';
import { calculateReservationTotal, formatCurrency, getNights } from '@/lib/stay/format';

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
	const total = nights > 0 ? calculateReservationTotal(apartment, form.checkIn, form.checkOut) : apartment.pricePerNight;

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
				throw new Error('Rezervacija nije sacuvana.');
			}

			setStatus('success');
			setMessage('Upit je sacuvan. Admin ce potvrditi termin i poslati detalje na email.');
			setForm(initialState);
		} catch (error) {
			setStatus('error');
			setMessage((error as Error).message);
		}
	}

	return (
		<div className="site-surface tw-p-7">
			<div className="d-flex justify-content-between gap-3 flex-wrap tw-mb-5">
				<div>
					<p className="text-uppercase tw-text-xs text-main-600 fw-semibold mb-2">Direktna rezervacija</p>
					<h3 className="tw-text-8 fw-normal text-white mb-0">{apartment.name}</h3>
				</div>
				<div className="text-end">
					<p className="mb-0 text-white">{formatCurrency(apartment.pricePerNight)} / noc</p>
					<p className="mb-0 text-white-50 tw-text-sm">Ciscenje {formatCurrency(apartment.cleaningFee)}</p>
				</div>
			</div>
			<form className="row g-4" onSubmit={handleSubmit}>
				<div className="col-md-6">
					<input
						value={form.guestName}
						onChange={(event) => setForm((current) => ({ ...current, guestName: event.target.value }))}
						className="site-input"
						placeholder="Ime i prezime"
						required
					/>
				</div>
				<div className="col-md-6">
					<input
						type="email"
						value={form.guestEmail}
						onChange={(event) => setForm((current) => ({ ...current, guestEmail: event.target.value }))}
						className="site-input"
						placeholder="Email"
						required
					/>
				</div>
				<div className="col-md-6">
					<input
						value={form.guestPhone}
						onChange={(event) => setForm((current) => ({ ...current, guestPhone: event.target.value }))}
						className="site-input"
						placeholder="Telefon"
						required
					/>
				</div>
				<div className="col-md-6">
					<input
						type="number"
						min={1}
						max={apartment.guests}
						value={form.guests}
						onChange={(event) => setForm((current) => ({ ...current, guests: event.target.value }))}
						className="site-input"
						placeholder="Broj gostiju"
						required
					/>
				</div>
				<div className="col-md-6">
					<input
						type="date"
						value={form.checkIn}
						onChange={(event) => setForm((current) => ({ ...current, checkIn: event.target.value }))}
						className="site-input"
						required
					/>
				</div>
				<div className="col-md-6">
					<input
						type="date"
						value={form.checkOut}
						onChange={(event) => setForm((current) => ({ ...current, checkOut: event.target.value }))}
						className="site-input"
						required
					/>
				</div>
				<div className="col-12">
					<textarea
						value={form.notes}
						onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
						className="site-input site-textarea"
						placeholder="Napomena za dolazak, parking ili check-in"
					/>
				</div>
				<div className="col-12 d-flex justify-content-between gap-3 flex-wrap align-items-center">
					<div>
						<p className="mb-1 text-white">Procena ukupno: {formatCurrency(total)}</p>
						<p className="mb-0 text-white-50 tw-text-sm">{nights > 0 ? `${nights} nocenja` : 'Izaberi datume za obracun.'}</p>
					</div>
					<button
						type="submit"
						className="tw-btn-hover-white bg-main-600 tw-py-4 tw-px-8 text-heading font-heading d-inline-flex align-items-center tw-gap-2 tw-rounded-lg border-0"
						disabled={status === 'loading'}
					>
						{status === 'loading' ? 'Slanje...' : 'Posalji upit'}
					</button>
				</div>
				{message ? <div className={`col-12 ${status === 'success' ? 'text-success' : 'text-danger'}`}>{message}</div> : null}
			</form>
		</div>
	);
}

export default BookingRequestForm;
