'use client';

import { useRef, useState } from 'react';
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
const baseState = { guestName: '', guestEmail: '', guestPhone: '', guests: '2', notes: '' };

const formatDate = (value: string) =>
	value
		? new Intl.DateTimeFormat('sr-Latn-RS', { day: '2-digit', month: 'short' }).format(
				new Date(`${value}T12:00:00`)
			)
		: '—';

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
	const [showDetails, setShowDetails] = useState(validInitial);
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState('');
	const detailsRef = useRef<HTMLDivElement>(null);
	const nights = form.checkIn && form.checkOut ? getNights(form.checkIn, form.checkOut) : 0;
	const total =
		nights > 0 ? calculateReservationTotal(apartment, form.checkIn, form.checkOut) : apartment.pricePerNight;
	const datesReady = Boolean(form.checkIn && form.checkOut && nights > 0);
	const fieldId = (name: string) => `booking-${apartment.id}-${name}`;

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
				const result = (await response.json().catch(() => null)) as { error?: string } | null;
				throw new Error(
					response.status === 409
						? 'Termin je upravo zauzet. Izaberite drugi period.'
						: result?.error || 'Rezervacija nije sačuvana.'
				);
			}

			setStatus('success');
			setMessage('Upit je sačuvan. Domaćin će potvrditi termin i poslati detalje na email.');
			setForm({ ...baseState, checkIn: '', checkOut: '' });
			setShowDetails(false);
		} catch (error) {
			setStatus('error');
			setMessage((error as Error).message);
		}
	}

	function update(key: keyof typeof form, value: string) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	function continueToDetails() {
		setShowDetails(true);
		requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
	}

	return (
		<div className={styles.panel}>
			<header className={styles.header}>
				<div>
					<p className={styles.kicker}>Rezervišite direktno</p>
					<h3 className={styles.title}>{apartment.name}</h3>
				</div>
				<div className={styles.rate}>
					<p>
						{formatCurrency(apartment.pricePerNight)} <small>/ noć</small>
					</p>
					<span>Bez provizije platforme</span>
				</div>
			</header>
			<nav
				className={styles.steps}
				aria-label="Koraci rezervacije"
			>
				<span data-active="true">
					<b>01</b> Datumi
				</span>
				<span data-active={showDetails}>
					<b>02</b> Podaci
				</span>
				<span data-active={status === 'success'}>
					<b>03</b> Potvrda
				</span>
			</nav>
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
						onChange={(range) => {
							setForm((current) => ({ ...current, ...range }));
							setShowDetails(false);
						}}
						label={`Izbor datuma za ${apartment.name}`}
					/>
				</div>
				{datesReady && !showDetails ? (
					<section
						className={styles.readyCard}
						aria-live="polite"
					>
						<div className={styles.readyDates}>
							<span>{formatDate(form.checkIn)}</span>
							<i aria-hidden="true">→</i>
							<span>{formatDate(form.checkOut)}</span>
						</div>
						<div className={styles.readyTotal}>
							<span>
								{nights} {nights === 1 ? 'noć' : 'noći'} · ukupno
							</span>
							<strong>{formatCurrency(total)}</strong>
						</div>
						<button
							type="button"
							onClick={continueToDetails}
						>
							Nastavi sa podacima <span aria-hidden="true">→</span>
						</button>
					</section>
				) : null}
				{showDetails ? (
					<div
						className={styles.details}
						ref={detailsRef}
					>
						<div className={styles.detailsHeading}>
							<span>02</span>
							<div>
								<p>Vaši podaci</p>
								<small>Još samo minut do slanja upita.</small>
							</div>
						</div>
						<div className={styles.fields}>
							<Field
								id={fieldId('guestName')}
								label="Ime i prezime"
								value={form.guestName}
								onChange={(value) => update('guestName', value)}
								placeholder="Vaše ime i prezime"
								autoComplete="name"
								required
							/>
							<Field
								id={fieldId('guestEmail')}
								label="Email"
								type="email"
								value={form.guestEmail}
								onChange={(value) => update('guestEmail', value)}
								placeholder="ime@primer.rs"
								autoComplete="email"
								inputMode="email"
								required
							/>
							<Field
								id={fieldId('guestPhone')}
								label="Telefon"
								type="tel"
								value={form.guestPhone}
								onChange={(value) => update('guestPhone', value)}
								placeholder="+381 60 000 0000"
								autoComplete="tel"
								inputMode="tel"
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
								inputMode="numeric"
								required
							/>
							<label className={`${styles.field} ${styles.fullWidth}`}>
								<span>
									Napomena <em>opciono</em>
								</span>
								<textarea
									id={fieldId('notes')}
									value={form.notes}
									onChange={(event) => update('notes', event.target.value)}
									placeholder="Dolazak, parking ili posebna napomena"
								/>
							</label>
						</div>
						<div className={styles.summary}>
							<div>
								<span>
									{formatDate(form.checkIn)} — {formatDate(form.checkOut)} · {nights} noći
								</span>
								<p>{formatCurrency(total)}</p>
							</div>
							<button
								type="submit"
								disabled={status === 'loading'}
							>
								{status === 'loading' ? 'Slanje…' : 'Pošalji upit'} <span aria-hidden="true">→</span>
							</button>
						</div>
					</div>
				) : null}
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
	max,
	autoComplete,
	inputMode
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
	autoComplete?: string;
	inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
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
				autoComplete={autoComplete}
				inputMode={inputMode}
			/>
		</label>
	);
}
