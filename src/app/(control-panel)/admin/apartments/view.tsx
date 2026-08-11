'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import { apartmentSchema } from '@/lib/stay/schema';
import type { Apartment } from '@/lib/stay/types';
import { formatCurrency } from '@/lib/stay/format';
import ApartmentMediaEditor from './ApartmentMediaEditor';
import styles from './admin-apartments.module.css';

type Props = { initialApartments: Apartment[] };
type FormState = {
	id?: string;
	name: string;
	slug: string;
	teaser: string;
	description: string;
	coverImage: string;
	gallery: string[];
	guests: string;
	beds: string;
	baths: string;
	size: string;
	pricePerNight: string;
	cleaningFee: string;
	rating: string;
	reviewCount: string;
	featured: boolean;
	locationNote: string;
	amenities: string;
	rules: string;
};
type FieldErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
	name: '',
	slug: '',
	teaser: '',
	description: '',
	coverImage: '/site-assets/images/custom/hero-main.jpeg',
	gallery: ['/site-assets/images/custom/living-room.jpeg'],
	guests: '2',
	beds: '1',
	baths: '1',
	size: '35',
	pricePerNight: '60',
	cleaningFee: '15',
	rating: '4.9',
	reviewCount: '0',
	featured: false,
	locationNote: 'Centar Niša',
	amenities: 'Self check-in, Fast Wi-Fi, Air conditioning, Kitchen',
	rules: 'Check-in od 14:00, Nema pušenja'
};

const labels: Partial<Record<keyof FormState, string>> = {
	name: 'Naziv',
	slug: 'Slug',
	teaser: 'Kratak opis',
	description: 'Opis',
	coverImage: 'Naslovna fotografija',
	gallery: 'Galerija',
	guests: 'Broj gostiju',
	beds: 'Broj kreveta',
	baths: 'Broj kupatila',
	size: 'Kvadratura',
	pricePerNight: 'Cena po noći',
	cleaningFee: 'Čišćenje',
	rating: 'Ocena',
	reviewCount: 'Broj recenzija',
	locationNote: 'Lokacija',
	amenities: 'Sadržaji',
	rules: 'Pravila'
};

function toForm(apartment: Apartment): FormState {
	return {
		...apartment,
		guests: String(apartment.guests),
		beds: String(apartment.beds),
		baths: String(apartment.baths),
		size: String(apartment.size),
		pricePerNight: String(apartment.pricePerNight),
		cleaningFee: String(apartment.cleaningFee),
		rating: String(apartment.rating),
		reviewCount: String(apartment.reviewCount),
		amenities: apartment.amenities.join(', '),
		rules: apartment.rules.join(', ')
	};
}

function numeric(value: string) {
	return Number(value.trim().replace(',', '.'));
}

function toPayload(form: FormState) {
	return {
		name: form.name.trim(),
		slug: form.slug.trim(),
		teaser: form.teaser.trim(),
		description: form.description.trim(),
		coverImage: form.coverImage,
		gallery: form.gallery.length ? form.gallery : [form.coverImage].filter(Boolean),
		guests: numeric(form.guests),
		beds: numeric(form.beds),
		baths: numeric(form.baths),
		size: numeric(form.size),
		pricePerNight: numeric(form.pricePerNight),
		cleaningFee: numeric(form.cleaningFee),
		rating: numeric(form.rating),
		reviewCount: numeric(form.reviewCount),
		featured: form.featured,
		locationNote: form.locationNote.trim(),
		amenities: form.amenities
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean),
		rules: form.rules
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean)
	};
}

function humanizeErrors(fieldErrors: Record<string, string[] | undefined>) {
	return Object.fromEntries(
		Object.entries(fieldErrors).map(([field, messages]) => [
			field,
			`${labels[field as keyof FormState] ?? field}: ${messages?.[0] ?? 'vrednost nije ispravna'}`
		])
	) as FieldErrors;
}

export default function ApartmentsAdminView({ initialApartments }: Props) {
	const [apartments, setApartments] = useState(initialApartments);
	const [form, setForm] = useState<FormState | null>(null);
	const [errors, setErrors] = useState<FieldErrors>({});
	const [feedback, setFeedback] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);
	const [saving, setSaving] = useState(false);
	const [uploading, setUploading] = useState(false);

	function update<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
		setForm((current) => (current ? { ...current, [key]: value } : current));
		setErrors((current) => ({ ...current, [key]: undefined }));
	}

	async function uploadFile(file: File) {
		if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type))
			throw new Error('Dozvoljeni formati su JPEG, PNG, WebP i AVIF.');

		if (file.size > 8 * 1024 * 1024) throw new Error('Slika mora biti manja od 8 MB.');

		const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
		return upload(`apartments/${Date.now()}-${safeName}`, file, {
			access: 'public',
			handleUploadUrl: '/api/stay/uploads',
			contentType: file.type
		});
	}

	async function uploadGallery(files: FileList | null) {
		if (!files?.length || !form) return;

		setUploading(true);
		setFeedback(null);
		try {
			const urls = (await Promise.all(Array.from(files).map(uploadFile))).map((blob) => blob.url);
			setForm((current) =>
				current
					? {
							...current,
							coverImage: current.coverImage || urls[0] || '',
							gallery: [...current.gallery, ...urls.filter((url) => url !== current.coverImage)]
						}
					: current
			);
		} catch (error) {
			setFeedback({ type: 'error', message: (error as Error).message });
		} finally {
			setUploading(false);
		}
	}

	async function save() {
		if (!form) return;

		setFeedback(null);
		setErrors({});
		const payload = toPayload(form);
		const parsed = apartmentSchema.safeParse(payload);

		if (!parsed.success) {
			setErrors(humanizeErrors(parsed.error.flatten().fieldErrors));
			setFeedback({
				type: 'error',
				message: 'Proverite označena polja pre čuvanja.'
			});
			return;
		}

		setSaving(true);
		try {
			const response = await fetch(form.id ? `/api/stay/apartments/${form.id}` : '/api/stay/apartments', {
				method: form.id ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data)
			});
			const result = (await response.json().catch(() => null)) as
				| Apartment
				| {
						error?: {
							fieldErrors?: Record<string, string[]>;
							formErrors?: string[];
						};
				  }
				| null;

			if (!response.ok) {
				const apiError = result && 'error' in result ? result.error : undefined;

				if (apiError?.fieldErrors) setErrors(humanizeErrors(apiError.fieldErrors));

				throw new Error(apiError?.formErrors?.[0] || 'Apartman nije sačuvan. Proverite označena polja.');
			}

			const apartment = result as Apartment;
			setApartments((current) =>
				form.id ? current.map((item) => (item.id === apartment.id ? apartment : item)) : [...current, apartment]
			);
			setForm(null);
			setFeedback({
				type: 'success',
				message: 'Podaci o apartmanu su sačuvani.'
			});
		} catch (error) {
			setFeedback({ type: 'error', message: (error as Error).message });
		} finally {
			setSaving(false);
		}
	}

	async function remove(apartment: Apartment) {
		if (!window.confirm(`Obriši ${apartment.name} i povezane rezervacije?`)) return;

		const response = await fetch(`/api/stay/apartments/${apartment.id}`, {
			method: 'DELETE'
		});

		if (!response.ok) {
			setFeedback({ type: 'error', message: 'Brisanje nije uspelo.' });
			return;
		}

		setApartments((current) => current.filter((item) => item.id !== apartment.id));
		setFeedback({ type: 'success', message: 'Apartman je obrisan.' });
	}

	if (form)
		return (
			<div className={styles.page}>
				<header className={styles.editorHeader}>
					<div>
						<button
							className={styles.back}
							type="button"
							onClick={() => setForm(null)}
						>
							← Apartmani
						</button>
						<p className={styles.eyebrow}>{form.id ? 'Izmena apartmana' : 'Novi apartman'}</p>
						<h1>{form.name || 'Novi apartman'}</h1>
					</div>
					<button
						className={styles.primary}
						type="button"
						onClick={() => void save()}
						disabled={saving || uploading}
					>
						{saving ? 'Čuvanje…' : 'Sačuvaj izmene'}
					</button>
				</header>
				{feedback ? (
					<p
						className={styles.feedback}
						data-type={feedback.type}
						role="alert"
					>
						{feedback.message}
					</p>
				) : null}
				<div className={styles.editorGrid}>
					<section className={styles.formSection}>
						<h2>Osnovni podaci</h2>
						<div className={styles.fields}>
							<Field
								label="Naziv"
								value={form.name}
								error={errors.name}
								onChange={(value) => update('name', value)}
							/>
							<Field
								label="Slug"
								value={form.slug}
								error={errors.slug}
								onChange={(value) => update('slug', value)}
							/>
							<Field
								wide
								label="Kratak opis"
								value={form.teaser}
								error={errors.teaser}
								onChange={(value) => update('teaser', value)}
							/>
							<Field
								wide
								multiline
								label="Opis"
								value={form.description}
								error={errors.description}
								onChange={(value) => update('description', value)}
							/>
							<Field
								wide
								label="Lokacija"
								value={form.locationNote}
								error={errors.locationNote}
								onChange={(value) => update('locationNote', value)}
							/>
						</div>
					</section>
					<section className={styles.formSection}>
						<h2>Fotografije</h2>
						<ApartmentMediaEditor
							coverImage={form.coverImage}
							gallery={form.gallery}
							uploading={uploading}
							onUpload={uploadGallery}
							onChange={(value) => setForm((current) => (current ? { ...current, ...value } : current))}
						/>
						{errors.gallery ? <p className={styles.error}>{errors.gallery}</p> : null}
					</section>
					<section className={styles.formSection}>
						<h2>Kapacitet i cena</h2>
						<div className={styles.fieldsSmall}>
							{(
								[
									'guests',
									'beds',
									'baths',
									'size',
									'pricePerNight',
									'cleaningFee',
									'rating',
									'reviewCount'
								] as const
							).map((key) => (
								<Field
									key={key}
									type="text"
									inputMode="decimal"
									label={labels[key] ?? key}
									value={form[key]}
									error={errors[key]}
									onChange={(value) => update(key, value)}
								/>
							))}
						</div>
					</section>
					<section className={styles.formSection}>
						<h2>Sadržaji i pravila</h2>
						<div className={styles.fields}>
							<Field
								wide
								multiline
								label="Sadržaji, odvojeni zarezom"
								value={form.amenities}
								error={errors.amenities}
								onChange={(value) => update('amenities', value)}
							/>
							<Field
								wide
								multiline
								label="Pravila, odvojena zarezom"
								value={form.rules}
								error={errors.rules}
								onChange={(value) => update('rules', value)}
							/>
							<label className={styles.toggle}>
								<input
									type="checkbox"
									checked={form.featured}
									onChange={(event) => update('featured', event.target.checked)}
								/>
								<span>Prikaži na početnoj strani</span>
							</label>
						</div>
					</section>
				</div>
				<div className={styles.stickyActions}>
					<button
						className={styles.secondary}
						type="button"
						onClick={() => setForm(null)}
					>
						Odustani
					</button>
					<button
						className={styles.primary}
						type="button"
						onClick={() => void save()}
						disabled={saving || uploading}
					>
						{saving ? 'Čuvanje…' : 'Sačuvaj'}
					</button>
				</div>
			</div>
		);

	return (
		<div className={styles.page}>
			<header className={styles.listHeader}>
				<div>
					<p className={styles.eyebrow}>Smeštajne jedinice</p>
					<h1>Apartmani</h1>
					<p>Uredite sadržaj, cenu i fotografije bez skrivenih mobilnih akcija.</p>
				</div>
				<button
					className={styles.primary}
					type="button"
					onClick={() => setForm({ ...emptyForm })}
				>
					+ Dodaj apartman
				</button>
			</header>
			{feedback ? (
				<p
					className={styles.feedback}
					data-type={feedback.type}
					role="status"
				>
					{feedback.message}
				</p>
			) : null}
			<div className={styles.cards}>
				{apartments.map((apartment, index) => (
					<article
						className={styles.card}
						key={apartment.id}
					>
						<div className={styles.cover}>
							<img
								src={apartment.coverImage}
								alt=""
							/>
							<span>{String(index + 1).padStart(2, '0')}</span>
						</div>
						<div className={styles.cardBody}>
							<div>
								<p className={styles.location}>{apartment.locationNote}</p>
								<h2>{apartment.name}</h2>
								<p className={styles.slug}>/{apartment.slug}</p>
							</div>
							<dl>
								<div>
									<dt>Noćenje</dt>
									<dd>{formatCurrency(apartment.pricePerNight)}</dd>
								</div>
								<div>
									<dt>Kapacitet</dt>
									<dd>{apartment.guests} gosta</dd>
								</div>
								<div>
									<dt>Status</dt>
									<dd>{apartment.featured ? 'Istaknut' : 'Standard'}</dd>
								</div>
							</dl>
							<div className={styles.actions}>
								<button
									className={styles.primary}
									type="button"
									onClick={() => setForm(toForm(apartment))}
								>
									Izmeni apartman
								</button>
								<a
									className={styles.secondary}
									href={`/apartments/${apartment.slug}`}
									target="_blank"
									rel="noreferrer"
								>
									Pogledaj ↗
								</a>
								<button
									className={styles.danger}
									type="button"
									onClick={() => void remove(apartment)}
								>
									Obriši
								</button>
							</div>
						</div>
					</article>
				))}
			</div>
		</div>
	);
}

function Field({
	label,
	value,
	error,
	onChange,
	wide,
	multiline,
	type = 'text',
	inputMode
}: {
	label: string;
	value: string;
	error?: string;
	onChange: (value: string) => void;
	wide?: boolean;
	multiline?: boolean;
	type?: string;
	inputMode?: 'decimal';
}) {
	const Control = multiline ? 'textarea' : 'input';
	return (
		<label className={wide ? styles.wide : undefined}>
			<span>{label}</span>
			<Control
				value={value}
				type={multiline ? undefined : type}
				inputMode={inputMode}
				rows={multiline ? 4 : undefined}
				aria-invalid={Boolean(error)}
				onChange={(event) => onChange(event.target.value)}
			/>
			{error ? <small className={styles.error}>{error}</small> : null}
		</label>
	);
}
