'use client';

import { useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	InputAdornment,
	MenuItem,
	Paper,
	Snackbar,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TableSortLabel,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { EmptyState, PageHeader, StatCard, StatusPill, adminSurface } from '@/components/admin/ui';
import { formatCurrency, formatDateRange, getNights } from '@/lib/stay/format';
import { nextStatus, nextStatusLabels, sourceLabels, statusLabels, toIsoDate } from '@/lib/stay/labels';
import { Apartment, Reservation } from '@/lib/stay/types';

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

type SortKey = 'checkIn' | 'guestName' | 'totalPrice' | 'status';

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

function toCsv(reservations: Reservation[], apartmentNames: Record<string, string>) {
	const header = [
		'Apartman',
		'Gost',
		'Email',
		'Telefon',
		'Check-in',
		'Check-out',
		'Noci',
		'Gostiju',
		'Izvor',
		'Status',
		'Iznos'
	];
	const rows = reservations.map((reservation) => [
		apartmentNames[reservation.apartmentId] || reservation.apartmentId,
		reservation.guestName,
		reservation.guestEmail,
		reservation.guestPhone,
		reservation.checkIn,
		reservation.checkOut,
		`${getNights(reservation.checkIn, reservation.checkOut)}`,
		`${reservation.guests}`,
		reservation.source,
		reservation.status,
		`${reservation.totalPrice}`
	]);

	return [header, ...rows]
		.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
		.join('\n');
}

function ReservationsAdminView({ initialApartments, initialReservations }: ReservationsAdminViewProps) {
	const today = toIsoDate(new Date());
	const [reservations, setReservations] = useState(initialReservations);
	const [form, setForm] = useState<ReservationFormState>({
		...emptyForm,
		apartmentId: initialApartments[0]?.id || ''
	});
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [sourceFilter, setSourceFilter] = useState('all');
	const [apartmentFilter, setApartmentFilter] = useState('all');
	const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'current' | 'past'>('upcoming');
	const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
		key: 'checkIn',
		direction: 'asc'
	});
	const [selected, setSelected] = useState<string[]>([]);
	const [confirmDelete, setConfirmDelete] = useState<Reservation | null>(null);

	const apartmentNameMap = useMemo(
		() => Object.fromEntries(initialApartments.map((apartment) => [apartment.id, apartment.name])),
		[initialApartments]
	);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();

		const rows = reservations.filter((reservation) => {
			if (statusFilter !== 'all' && reservation.status !== statusFilter) {
				return false;
			}

			if (sourceFilter !== 'all' && reservation.source !== sourceFilter) {
				return false;
			}

			if (apartmentFilter !== 'all' && reservation.apartmentId !== apartmentFilter) {
				return false;
			}

			if (timeFilter === 'upcoming' && reservation.checkIn < today) {
				return false;
			}

			if (timeFilter === 'current' && !(reservation.checkIn <= today && today < reservation.checkOut)) {
				return false;
			}

			if (timeFilter === 'past' && reservation.checkOut >= today) {
				return false;
			}

			if (!term) {
				return true;
			}

			return [
				reservation.guestName,
				reservation.guestEmail,
				reservation.guestPhone,
				reservation.notes || '',
				apartmentNameMap[reservation.apartmentId] || ''
			]
				.join(' ')
				.toLowerCase()
				.includes(term);
		});

		const direction = sort.direction === 'asc' ? 1 : -1;

		return rows.sort((first, second) => {
			if (sort.key === 'totalPrice') {
				return (first.totalPrice - second.totalPrice) * direction;
			}

			return String(first[sort.key]).localeCompare(String(second[sort.key])) * direction;
		});
	}, [apartmentFilter, apartmentNameMap, reservations, search, sort, sourceFilter, statusFilter, timeFilter, today]);

	const totals = useMemo(() => {
		const revenue = filtered.reduce((sum, reservation) => sum + reservation.totalPrice, 0);
		const nights = filtered.reduce(
			(sum, reservation) => sum + getNights(reservation.checkIn, reservation.checkOut),
			0
		);

		return {
			count: filtered.length,
			revenue,
			nights,
			pending: filtered.filter((reservation) => reservation.status === 'pending').length,
			averageStay: filtered.length ? nights / filtered.length : 0
		};
	}, [filtered]);

	function updateField<Key extends keyof ReservationFormState>(key: Key, value: ReservationFormState[Key]) {
		setForm((current) => ({ ...current, [key]: value }));
	}

	function toggleSort(key: SortKey) {
		setSort((current) =>
			current.key === key
				? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
				: { key, direction: 'asc' }
		);
	}

	function openCreate() {
		setForm({ ...emptyForm, apartmentId: initialApartments[0]?.id || '' });
		setOpen(true);
	}

	function openEdit(reservation: Reservation) {
		setForm(toForm(reservation));
		setOpen(true);
	}

	function exportCsv() {
		// The BOM keeps Excel from mangling the Serbian characters.
		const bom = String.fromCharCode(0xfeff);
		const blob = new Blob([`${bom}${toCsv(filtered, apartmentNameMap)}`], {
			type: 'text/csv;charset=utf-8'
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `rezervacije-${today}.csv`;
		anchor.click();
		URL.revokeObjectURL(url);
	}

	async function saveReservation() {
		setSaving(true);

		try {
			const response = await fetch(form.id ? `/api/stay/reservations/${form.id}` : '/api/stay/reservations', {
				method: form.id ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
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
				const body = await response.json().catch(() => null);
				setFeedback({
					type: 'error',
					message: typeof body?.error === 'string' ? body.error : 'Rezervacija nije sacuvana.'
				});
				return;
			}

			const reservation = (await response.json()) as Reservation;

			setReservations((current) =>
				form.id
					? current.map((item) => (item.id === reservation.id ? reservation : item))
					: [...current, reservation]
			);
			setOpen(false);
			setFeedback({ type: 'success', message: 'Rezervacija je sacuvana.' });
		} finally {
			setSaving(false);
		}
	}

	async function patchStatus(reservation: Reservation, status: Reservation['status']) {
		const response = await fetch(`/api/stay/reservations/${reservation.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status })
		});

		if (!response.ok) {
			setFeedback({ type: 'error', message: 'Status nije promenjen.' });
			return;
		}

		const updated = (await response.json()) as Reservation;
		setReservations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
	}

	async function bulkStatus(status: Reservation['status']) {
		const targets = reservations.filter((reservation) => selected.includes(reservation.id));

		await Promise.all(targets.map((reservation) => patchStatus(reservation, status)));
		setSelected([]);
		setFeedback({ type: 'success', message: `Promenjen status za ${targets.length} rezervacija.` });
	}

	async function deleteReservation(reservation: Reservation) {
		const response = await fetch(`/api/stay/reservations/${reservation.id}`, { method: 'DELETE' });

		setConfirmDelete(null);

		if (!response.ok) {
			setFeedback({ type: 'error', message: 'Brisanje nije uspelo.' });
			return;
		}

		setReservations((current) => current.filter((item) => item.id !== reservation.id));
		setFeedback({ type: 'success', message: 'Rezervacija je obrisana.' });
	}

	const allSelected = filtered.length > 0 && selected.length === filtered.length;

	return (
		<Stack
			spacing={3}
			padding={{ xs: 0, md: 1 }}
		>
			<PageHeader
				eyebrow="Operacije"
				title="Rezervacije"
				description="Pretraga, filtriranje, grupne promene statusa i izvoz u CSV."
				actions={
					<>
						<Button
							variant="outlined"
							startIcon={<DownloadIcon />}
							onClick={exportCsv}
							disabled={filtered.length === 0}
						>
							Izvezi CSV
						</Button>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={openCreate}
						>
							Nova rezervacija
						</Button>
					</>
				}
			/>

			<Grid
				container
				spacing={2}
			>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Prikazano"
						value={totals.count}
						hint={`${totals.nights} noci ukupno`}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Vrednost"
						value={formatCurrency(Math.round(totals.revenue))}
						tone="positive"
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Ceka potvrdu"
						value={totals.pending}
						tone={totals.pending ? 'warning' : 'neutral'}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 3 }}>
					<StatCard
						label="Prosek boravka"
						value={`${totals.averageStay.toFixed(1)} noci`}
					/>
				</Grid>
			</Grid>

			<Paper sx={{ ...adminSurface, p: { xs: 1.5, md: 2.5 } }}>
				<Stack
					direction={{ xs: 'column', lg: 'row' }}
					spacing={1.5}
					alignItems={{ lg: 'center' }}
					marginBottom={2}
					flexWrap="wrap"
					useFlexGap
				>
					<TextField
						size="small"
						placeholder="Pretrazi gosta, email, telefon..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						sx={{ minWidth: 260, flex: 1 }}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon fontSize="small" />
									</InputAdornment>
								)
							}
						}}
					/>
					<ToggleButtonGroup
						size="small"
						exclusive
						value={timeFilter}
						onChange={(_, value) => value && setTimeFilter(value)}
					>
						<ToggleButton value="upcoming">Predstoje</ToggleButton>
						<ToggleButton value="current">U toku</ToggleButton>
						<ToggleButton value="past">Prosle</ToggleButton>
						<ToggleButton value="all">Sve</ToggleButton>
					</ToggleButtonGroup>
					<TextField
						select
						size="small"
						label="Status"
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						sx={{ minWidth: 160 }}
					>
						<MenuItem value="all">Svi statusi</MenuItem>
						{Object.entries(statusLabels).map(([status, label]) => (
							<MenuItem
								key={status}
								value={status}
							>
								{label}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						size="small"
						label="Izvor"
						value={sourceFilter}
						onChange={(event) => setSourceFilter(event.target.value)}
						sx={{ minWidth: 150 }}
					>
						<MenuItem value="all">Svi izvori</MenuItem>
						{Object.entries(sourceLabels).map(([source, label]) => (
							<MenuItem
								key={source}
								value={source}
							>
								{label}
							</MenuItem>
						))}
					</TextField>
					<TextField
						select
						size="small"
						label="Apartman"
						value={apartmentFilter}
						onChange={(event) => setApartmentFilter(event.target.value)}
						sx={{ minWidth: 170 }}
					>
						<MenuItem value="all">Svi apartmani</MenuItem>
						{initialApartments.map((apartment) => (
							<MenuItem
								key={apartment.id}
								value={apartment.id}
							>
								{apartment.name}
							</MenuItem>
						))}
					</TextField>
				</Stack>

				{selected.length > 0 ? (
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						sx={{
							mb: 2,
							p: 1.25,
							borderRadius: 2,
							backgroundColor: 'rgba(49, 92, 240, 0.08)',
							flexWrap: 'wrap'
						}}
						useFlexGap
					>
						<Typography
							variant="body2"
							fontWeight={700}
						>
							Izabrano: {selected.length}
						</Typography>
						<Button
							size="small"
							onClick={() => bulkStatus('confirmed')}
						>
							Potvrdi
						</Button>
						<Button
							size="small"
							onClick={() => bulkStatus('checked-in')}
						>
							Prijavi
						</Button>
						<Button
							size="small"
							color="error"
							onClick={() => bulkStatus('cancelled')}
						>
							Otkazi
						</Button>
						<Button
							size="small"
							onClick={() => setSelected([])}
						>
							Ponisti izbor
						</Button>
					</Stack>
				) : null}

				{filtered.length === 0 ? (
					<EmptyState
						title="Nema rezervacija za ove filtere"
						hint="Promeni pretragu ili dodaj novu rezervaciju."
						action={
							<Button
								variant="contained"
								onClick={openCreate}
							>
								Nova rezervacija
							</Button>
						}
					/>
				) : (
					<Box sx={{ overflowX: 'auto' }}>
						<Table size="small">
							<TableHead>
								<TableRow>
									<TableCell padding="checkbox">
										<Checkbox
											checked={allSelected}
											indeterminate={selected.length > 0 && !allSelected}
											onChange={(event) =>
												setSelected(event.target.checked ? filtered.map((item) => item.id) : [])
											}
										/>
									</TableCell>
									<TableCell>
										<TableSortLabel
											active={sort.key === 'guestName'}
											direction={sort.direction}
											onClick={() => toggleSort('guestName')}
										>
											Gost
										</TableSortLabel>
									</TableCell>
									<TableCell>Apartman</TableCell>
									<TableCell>
										<TableSortLabel
											active={sort.key === 'checkIn'}
											direction={sort.direction}
											onClick={() => toggleSort('checkIn')}
										>
											Termin
										</TableSortLabel>
									</TableCell>
									<TableCell>Izvor</TableCell>
									<TableCell>
										<TableSortLabel
											active={sort.key === 'status'}
											direction={sort.direction}
											onClick={() => toggleSort('status')}
										>
											Status
										</TableSortLabel>
									</TableCell>
									<TableCell align="right">
										<TableSortLabel
											active={sort.key === 'totalPrice'}
											direction={sort.direction}
											onClick={() => toggleSort('totalPrice')}
										>
											Iznos
										</TableSortLabel>
									</TableCell>
									<TableCell align="right">Akcije</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filtered.map((reservation) => (
									<TableRow
										key={reservation.id}
										hover
										selected={selected.includes(reservation.id)}
									>
										<TableCell padding="checkbox">
											<Checkbox
												checked={selected.includes(reservation.id)}
												onChange={(event) =>
													setSelected((current) =>
														event.target.checked
															? [...current, reservation.id]
															: current.filter((id) => id !== reservation.id)
													)
												}
											/>
										</TableCell>
										<TableCell>
											<Typography
												variant="body2"
												fontWeight={700}
											>
												{reservation.guestName}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{reservation.guestEmail || reservation.guestPhone} ·{' '}
												{reservation.guests} gostiju
											</Typography>
										</TableCell>
										<TableCell>{apartmentNameMap[reservation.apartmentId]}</TableCell>
										<TableCell>
											<Typography variant="body2">
												{formatDateRange(reservation.checkIn, reservation.checkOut)}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{getNights(reservation.checkIn, reservation.checkOut)} noci
											</Typography>
										</TableCell>
										<TableCell>{sourceLabels[reservation.source]}</TableCell>
										<TableCell>
											<StatusPill
												status={reservation.status}
												label={statusLabels[reservation.status]}
											/>
										</TableCell>
										<TableCell align="right">{formatCurrency(reservation.totalPrice)}</TableCell>
										<TableCell align="right">
											<Stack
												direction="row"
												spacing={0.5}
												justifyContent="flex-end"
											>
												{nextStatus[reservation.status] ? (
													<Button
														size="small"
														onClick={() =>
															patchStatus(reservation, nextStatus[reservation.status]!)
														}
													>
														{nextStatusLabels[reservation.status]}
													</Button>
												) : null}
												<Tooltip title="Izmeni">
													<IconButton
														size="small"
														onClick={() => openEdit(reservation)}
													>
														<EditIcon fontSize="small" />
													</IconButton>
												</Tooltip>
												<Tooltip title="Obrisi">
													<IconButton
														size="small"
														color="error"
														onClick={() => setConfirmDelete(reservation)}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Box>
				)}
			</Paper>

			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>{form.id ? 'Izmeni rezervaciju' : 'Nova rezervacija'}</DialogTitle>
				<DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
					<TextField
						select
						label="Apartman"
						value={form.apartmentId}
						onChange={(event) => updateField('apartmentId', event.target.value)}
					>
						{initialApartments.map((apartment) => (
							<MenuItem
								key={apartment.id}
								value={apartment.id}
							>
								{apartment.name}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label="Gost"
						value={form.guestName}
						onChange={(event) => updateField('guestName', event.target.value)}
					/>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
					>
						<TextField
							label="Email"
							fullWidth
							value={form.guestEmail}
							onChange={(event) => updateField('guestEmail', event.target.value)}
						/>
						<TextField
							label="Telefon"
							fullWidth
							value={form.guestPhone}
							onChange={(event) => updateField('guestPhone', event.target.value)}
						/>
					</Stack>
					<Stack
						direction="row"
						spacing={2}
					>
						<TextField
							label="Check-in"
							type="date"
							fullWidth
							slotProps={{ inputLabel: { shrink: true } }}
							value={form.checkIn}
							onChange={(event) => updateField('checkIn', event.target.value)}
						/>
						<TextField
							label="Check-out"
							type="date"
							fullWidth
							slotProps={{ inputLabel: { shrink: true } }}
							value={form.checkOut}
							onChange={(event) => updateField('checkOut', event.target.value)}
						/>
					</Stack>
					<Stack
						direction="row"
						spacing={2}
					>
						<TextField
							label="Broj gostiju"
							type="number"
							fullWidth
							value={form.guests}
							onChange={(event) => updateField('guests', event.target.value)}
						/>
						<TextField
							select
							label="Izvor"
							fullWidth
							value={form.source}
							onChange={(event) => updateField('source', event.target.value as Reservation['source'])}
						>
							{Object.entries(sourceLabels).map(([source, label]) => (
								<MenuItem
									key={source}
									value={source}
								>
									{label}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							label="Status"
							fullWidth
							value={form.status}
							onChange={(event) => updateField('status', event.target.value as Reservation['status'])}
						>
							{Object.entries(statusLabels).map(([status, label]) => (
								<MenuItem
									key={status}
									value={status}
								>
									{label}
								</MenuItem>
							))}
						</TextField>
					</Stack>
					<TextField
						label="Napomena"
						multiline
						minRows={3}
						value={form.notes}
						onChange={(event) => updateField('notes', event.target.value)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpen(false)}>Odustani</Button>
					<Button
						variant="contained"
						onClick={saveReservation}
						disabled={saving}
					>
						Sacuvaj
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={Boolean(confirmDelete)}
				onClose={() => setConfirmDelete(null)}
			>
				<DialogTitle>Obrisati rezervaciju?</DialogTitle>
				<DialogContent>
					<Typography>
						{confirmDelete?.guestName} ·{' '}
						{confirmDelete ? formatDateRange(confirmDelete.checkIn, confirmDelete.checkOut) : ''}
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmDelete(null)}>Odustani</Button>
					<Button
						color="error"
						variant="contained"
						onClick={() => confirmDelete && deleteReservation(confirmDelete)}
					>
						Obrisi
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={Boolean(feedback)}
				autoHideDuration={4000}
				onClose={() => setFeedback(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			>
				<Alert
					severity={feedback?.type || 'success'}
					variant="filled"
					onClose={() => setFeedback(null)}
				>
					{feedback?.message}
				</Alert>
			</Snackbar>
		</Stack>
	);
}

export default ReservationsAdminView;
