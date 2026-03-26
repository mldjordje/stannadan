'use client';

import { useState } from 'react';
import {
	Alert,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Grid,
	IconButton,
	Paper,
	Stack,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import AddIcon from '@mui/icons-material/Add';
import { Apartment } from '@/lib/stay/types';
import { formatCurrency } from '@/lib/stay/format';

type ApartmentsAdminViewProps = {
	initialApartments: Apartment[];
};

type ApartmentFormState = {
	id?: string;
	name: string;
	slug: string;
	teaser: string;
	description: string;
	coverImage: string;
	gallery: string;
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

const emptyForm: ApartmentFormState = {
	name: '',
	slug: '',
	teaser: '',
	description: '',
	coverImage: '/site-assets/images/custom/hero-main.jpeg',
	gallery: '/site-assets/images/custom/hero-main.jpeg, /site-assets/images/custom/living-room.jpeg',
	guests: '2',
	beds: '1',
	baths: '1',
	size: '35',
	pricePerNight: '60',
	cleaningFee: '15',
	rating: '4.9',
	reviewCount: '0',
	featured: false,
	locationNote: 'Centar Nisa',
	amenities: 'Self check-in, Fast Wi-Fi, Air conditioning, Kitchen',
	rules: 'Check-in od 14:00, Nema pusenja'
};

function toForm(apartment: Apartment): ApartmentFormState {
	return {
		id: apartment.id,
		name: apartment.name,
		slug: apartment.slug,
		teaser: apartment.teaser,
		description: apartment.description,
		coverImage: apartment.coverImage,
		gallery: apartment.gallery.join(', '),
		guests: `${apartment.guests}`,
		beds: `${apartment.beds}`,
		baths: `${apartment.baths}`,
		size: `${apartment.size}`,
		pricePerNight: `${apartment.pricePerNight}`,
		cleaningFee: `${apartment.cleaningFee}`,
		rating: `${apartment.rating}`,
		reviewCount: `${apartment.reviewCount}`,
		featured: apartment.featured,
		locationNote: apartment.locationNote,
		amenities: apartment.amenities.join(', '),
		rules: apartment.rules.join(', ')
	};
}

function toPayload(form: ApartmentFormState) {
	return {
		name: form.name,
		slug: form.slug,
		teaser: form.teaser,
		description: form.description,
		coverImage: form.coverImage,
		gallery: form.gallery.split(',').map((item) => item.trim()).filter(Boolean),
		guests: Number(form.guests),
		beds: Number(form.beds),
		baths: Number(form.baths),
		size: Number(form.size),
		pricePerNight: Number(form.pricePerNight),
		cleaningFee: Number(form.cleaningFee),
		rating: Number(form.rating),
		reviewCount: Number(form.reviewCount),
		featured: form.featured,
		locationNote: form.locationNote,
		amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
		rules: form.rules.split(',').map((item) => item.trim()).filter(Boolean)
	};
}

function ApartmentsAdminView({ initialApartments }: ApartmentsAdminViewProps) {
	const [apartments, setApartments] = useState(initialApartments);
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<ApartmentFormState>(emptyForm);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [saving, setSaving] = useState(false);

	function openCreate() {
		setForm(emptyForm);
		setOpen(true);
	}

	function openEdit(apartment: Apartment) {
		setForm(toForm(apartment));
		setOpen(true);
	}

	function updateField<Key extends keyof ApartmentFormState>(key: Key, value: ApartmentFormState[Key]) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	async function saveApartment() {
		setSaving(true);
		setFeedback(null);

		try {
			const response = await fetch(form.id ? `/api/stay/apartments/${form.id}` : '/api/stay/apartments', {
				method: form.id ? 'PATCH' : 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(toPayload(form))
			});

			if (!response.ok) {
				throw new Error('Apartman nije sacuvan.');
			}

			const apartment = (await response.json()) as Apartment;

			setApartments((current) =>
				form.id ? current.map((item) => (item.id === apartment.id ? apartment : item)) : [...current, apartment]
			);
			setFeedback({ type: 'success', message: 'Podaci o apartmanu su sacuvani.' });
			setOpen(false);
		} catch (error) {
			setFeedback({ type: 'error', message: (error as Error).message });
		} finally {
			setSaving(false);
		}
	}

	async function deleteApartment(apartmentId: string) {
		const confirmed = window.confirm('Obrisi apartman i povezane rezervacije?');

		if (!confirmed) {
			return;
		}

		const response = await fetch(`/api/stay/apartments/${apartmentId}`, { method: 'DELETE' });

		if (response.ok) {
			setApartments((current) => current.filter((item) => item.id !== apartmentId));
			setFeedback({ type: 'success', message: 'Apartman je obrisan.' });
			return;
		}

		setFeedback({ type: 'error', message: 'Brisanje nije uspelo.' });
	}

	return (
		<Stack spacing={3} padding={3}>
			<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
				<div>
					<Typography variant="h4" fontWeight={700}>
						Apartmani
					</Typography>
					<Typography color="text.secondary">Dodavanje, izmena i pricing za sve jedinice u ponudi.</Typography>
				</div>
				<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
					Dodaj apartman
				</Button>
			</Stack>

			{feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : null}

			<Paper sx={{ overflow: 'hidden', borderRadius: 4 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Naziv</TableCell>
							<TableCell>Lokacija</TableCell>
							<TableCell>Kapacitet</TableCell>
							<TableCell>Cena</TableCell>
							<TableCell>Istaknut</TableCell>
							<TableCell align="right">Akcije</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{apartments.map((apartment) => (
							<TableRow key={apartment.id} hover>
								<TableCell>
									<Typography fontWeight={600}>{apartment.name}</Typography>
									<Typography variant="body2" color="text.secondary">
										{apartment.slug}
									</Typography>
								</TableCell>
								<TableCell>{apartment.locationNote}</TableCell>
								<TableCell>{apartment.guests} gosta</TableCell>
								<TableCell>{formatCurrency(apartment.pricePerNight)}</TableCell>
								<TableCell>
									<Chip color={apartment.featured ? 'secondary' : 'default'} label={apartment.featured ? 'Da' : 'Ne'} />
								</TableCell>
								<TableCell align="right">
									<IconButton onClick={() => openEdit(apartment)}>
										<EditIcon />
									</IconButton>
									<IconButton color="error" onClick={() => deleteApartment(apartment.id)}>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>

			<Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>{form.id ? 'Izmeni apartman' : 'Dodaj apartman'}</DialogTitle>
				<DialogContent>
					<Grid container spacing={2} sx={{ mt: 0.5 }}>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField label="Naziv" value={form.name} onChange={(event) => updateField('name', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField label="Slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} fullWidth />
						</Grid>
						<Grid size={12}>
							<TextField label="Teaser" value={form.teaser} onChange={(event) => updateField('teaser', event.target.value)} fullWidth />
						</Grid>
						<Grid size={12}>
							<TextField
								label="Opis"
								value={form.description}
								onChange={(event) => updateField('description', event.target.value)}
								fullWidth
								multiline
								minRows={3}
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								label="Cover image"
								value={form.coverImage}
								onChange={(event) => updateField('coverImage', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								label="Lokacija"
								value={form.locationNote}
								onChange={(event) => updateField('locationNote', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={12}>
							<TextField
								label="Galerija (zarezom odvojeni URL-ovi)"
								value={form.gallery}
								onChange={(event) => updateField('gallery', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField label="Gosti" type="number" value={form.guests} onChange={(event) => updateField('guests', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField label="Kreveti" type="number" value={form.beds} onChange={(event) => updateField('beds', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField label="Kupatila" type="number" value={form.baths} onChange={(event) => updateField('baths', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField label="m2" type="number" value={form.size} onChange={(event) => updateField('size', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField
								label="Cena po noci"
								type="number"
								value={form.pricePerNight}
								onChange={(event) => updateField('pricePerNight', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField
								label="Ciscenje"
								type="number"
								value={form.cleaningFee}
								onChange={(event) => updateField('cleaningFee', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField label="Rating" type="number" value={form.rating} onChange={(event) => updateField('rating', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 6, md: 3 }}>
							<TextField
								label="Broj recenzija"
								type="number"
								value={form.reviewCount}
								onChange={(event) => updateField('reviewCount', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={12}>
							<TextField
								label="Sadrzaji (zarezom odvojeni)"
								value={form.amenities}
								onChange={(event) => updateField('amenities', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={12}>
							<TextField label="Pravila" value={form.rules} onChange={(event) => updateField('rules', event.target.value)} fullWidth />
						</Grid>
						<Grid size={12}>
							<FormControlLabel
								control={<Switch checked={form.featured} onChange={(_, checked) => updateField('featured', checked)} />}
								label="Prikazi na landing page-u"
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Odustani</Button>
					<Button onClick={saveApartment} variant="contained" disabled={saving}>
						{saving ? 'Cuvanje...' : 'Sacuvaj'}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}

export default ApartmentsAdminView;
