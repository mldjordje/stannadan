'use client';

import { useMemo, useState } from 'react';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
	Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Apartment, Reservation } from '@/lib/stay/types';
import { formatCurrency, formatDateRange } from '@/lib/stay/format';

type ReservationsAdminViewProps = {
	initialApartments: Apartment[];
	initialReservations: Reservation[];
};

type ReservationFormState = {
	id?: string;
	apartmentId: string;
	guestName: string;
	guestEmail: string;
	guestPhone: string;
	checkIn: string;
	checkOut: string;
	guests: string;
	source: Reservation['source'];
	status: Reservation['status'];
	notes: string;
};

const emptyForm: ReservationFormState = {
	apartmentId: '',
	guestName: '',
	guestEmail: '',
	guestPhone: '',
	checkIn: '',
	checkOut: '',
	guests: '2',
	source: 'direct',
	status: 'pending',
	notes: ''
};

function toForm(reservation: Reservation): ReservationFormState {
	return {
		id: reservation.id,
		apartmentId: reservation.apartmentId,
		guestName: reservation.guestName,
		guestEmail: reservation.guestEmail,
		guestPhone: reservation.guestPhone,
		checkIn: reservation.checkIn,
		checkOut: reservation.checkOut,
		guests: `${reservation.guests}`,
		source: reservation.source,
		status: reservation.status,
		notes: reservation.notes || ''
	};
}

function ReservationsAdminView({ initialApartments, initialReservations }: ReservationsAdminViewProps) {
	const [reservations, setReservations] = useState(initialReservations);
	const [form, setForm] = useState<ReservationFormState>({ ...emptyForm, apartmentId: initialApartments[0]?.id || '' });
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

	const apartmentNameMap = useMemo(
		() => Object.fromEntries(initialApartments.map((apartment) => [apartment.id, apartment.name])),
		[initialApartments]
	);

	function updateField<Key extends keyof ReservationFormState>(key: Key, value: ReservationFormState[Key]) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	function openCreate() {
		setForm({ ...emptyForm, apartmentId: initialApartments[0]?.id || '' });
		setOpen(true);
	}

	function openEdit(reservation: Reservation) {
		setForm(toForm(reservation));
		setOpen(true);
	}

	async function saveReservation() {
		setSaving(true);
		setFeedback(null);

		try {
			const response = await fetch(form.id ? `/api/stay/reservations/${form.id}` : '/api/stay/reservations', {
				method: form.id ? 'PATCH' : 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					apartmentId: form.apartmentId,
					guestName: form.guestName,
					guestEmail: form.guestEmail,
					guestPhone: form.guestPhone,
					checkIn: form.checkIn,
					checkOut: form.checkOut,
					guests: Number(form.guests),
					source: form.source,
					status: form.status,
					notes: form.notes
				})
			});

			if (!response.ok) {
				throw new Error('Rezervacija nije sacuvana.');
			}

			const reservation = (await response.json()) as Reservation;

			setReservations((current) =>
				form.id ? current.map((item) => (item.id === reservation.id ? reservation : item)) : [...current, reservation]
			);
			setFeedback({ type: 'success', message: 'Rezervacija je sacuvana.' });
			setOpen(false);
		} catch (error) {
			setFeedback({ type: 'error', message: (error as Error).message });
		} finally {
			setSaving(false);
		}
	}

	async function deleteReservation(reservationId: string) {
		const confirmed = window.confirm('Obrisi rezervaciju?');

		if (!confirmed) {
			return;
		}

		const response = await fetch(`/api/stay/reservations/${reservationId}`, { method: 'DELETE' });

		if (response.ok) {
			setReservations((current) => current.filter((item) => item.id !== reservationId));
			setFeedback({ type: 'success', message: 'Rezervacija je obrisana.' });
			return;
		}

		setFeedback({ type: 'error', message: 'Brisanje nije uspelo.' });
	}

	return (
		<Stack spacing={3} padding={3}>
			<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
				<div>
					<Typography variant="h4" fontWeight={700}>
						Rezervacije
					</Typography>
					<Typography color="text.secondary">Direktni upiti, booking.com rezervacije i manualni unosi.</Typography>
				</div>
				<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
					Nova rezervacija
				</Button>
			</Stack>

			{feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : null}

			<Paper sx={{ overflow: 'hidden', borderRadius: 4 }}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>Gost</TableCell>
							<TableCell>Apartman</TableCell>
							<TableCell>Termin</TableCell>
							<TableCell>Izvor</TableCell>
							<TableCell>Status</TableCell>
							<TableCell>Cena</TableCell>
							<TableCell align="right">Akcije</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{reservations.map((reservation) => (
							<TableRow key={reservation.id} hover>
								<TableCell>
									<Typography fontWeight={600}>{reservation.guestName}</Typography>
									<Typography variant="body2" color="text.secondary">
										{reservation.guestEmail}
									</Typography>
								</TableCell>
								<TableCell>{apartmentNameMap[reservation.apartmentId]}</TableCell>
								<TableCell>{formatDateRange(reservation.checkIn, reservation.checkOut)}</TableCell>
								<TableCell>{reservation.source}</TableCell>
								<TableCell>{reservation.status}</TableCell>
								<TableCell>{formatCurrency(reservation.totalPrice)}</TableCell>
								<TableCell align="right">
									<IconButton onClick={() => openEdit(reservation)}>
										<EditIcon />
									</IconButton>
									<IconButton color="error" onClick={() => deleteReservation(reservation.id)}>
										<DeleteIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Paper>

			<Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
				<DialogTitle>{form.id ? 'Izmeni rezervaciju' : 'Nova rezervacija'}</DialogTitle>
				<DialogContent>
					<Grid container spacing={2} sx={{ mt: 0.5 }}>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								select
								label="Apartman"
								value={form.apartmentId}
								onChange={(event) => updateField('apartmentId', event.target.value)}
								fullWidth
							>
								{initialApartments.map((apartment) => (
									<MenuItem key={apartment.id} value={apartment.id}>
										{apartment.name}
									</MenuItem>
								))}
							</TextField>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField label="Gost" value={form.guestName} onChange={(event) => updateField('guestName', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField
								label="Email"
								type="email"
								value={form.guestEmail}
								onChange={(event) => updateField('guestEmail', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField label="Telefon" value={form.guestPhone} onChange={(event) => updateField('guestPhone', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<TextField
								label="Check-in"
								type="date"
								InputLabelProps={{ shrink: true }}
								value={form.checkIn}
								onChange={(event) => updateField('checkIn', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<TextField
								label="Check-out"
								type="date"
								InputLabelProps={{ shrink: true }}
								value={form.checkOut}
								onChange={(event) => updateField('checkOut', event.target.value)}
								fullWidth
							/>
						</Grid>
						<Grid size={{ xs: 12, md: 4 }}>
							<TextField label="Broj gostiju" type="number" value={form.guests} onChange={(event) => updateField('guests', event.target.value)} fullWidth />
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField select label="Izvor" value={form.source} onChange={(event) => updateField('source', event.target.value as Reservation['source'])} fullWidth>
								<MenuItem value="direct">Direct</MenuItem>
								<MenuItem value="booking.com">Booking.com</MenuItem>
								<MenuItem value="manual">Manual</MenuItem>
							</TextField>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<TextField select label="Status" value={form.status} onChange={(event) => updateField('status', event.target.value as Reservation['status'])} fullWidth>
								<MenuItem value="pending">Pending</MenuItem>
								<MenuItem value="confirmed">Confirmed</MenuItem>
								<MenuItem value="checked-in">Checked-in</MenuItem>
								<MenuItem value="checked-out">Checked-out</MenuItem>
								<MenuItem value="cancelled">Cancelled</MenuItem>
							</TextField>
						</Grid>
						<Grid size={12}>
							<TextField
								label="Napomena"
								value={form.notes}
								onChange={(event) => updateField('notes', event.target.value)}
								fullWidth
								multiline
								minRows={3}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Odustani</Button>
					<Button onClick={saveReservation} variant="contained" disabled={saving}>
						{saving ? 'Cuvanje...' : 'Sacuvaj'}
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}

export default ReservationsAdminView;
