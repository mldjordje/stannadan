'use client';

import { useCallback, useMemo, useState } from 'react';
import {
	Alert,
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Drawer,
	IconButton,
	MenuItem,
	Paper,
	Snackbar,
	Stack,
	TextField,
	Typography,
	useMediaQuery,
	useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/LockOutlined';
import LockOpenIcon from '@mui/icons-material/LockOpenOutlined';
import { PageHeader, StatusPill, adminSurface } from '@/components/admin/ui';
import { apartmentDay, dayOverview, stateColors, stateLabels } from '@/lib/stay/availability';
import { addDays, fromIsoDate, sourceLabels, statusLabels, toIsoDate } from '@/lib/stay/labels';
import { formatCurrency, getNights } from '@/lib/stay/format';
import type { Apartment, CalendarBlock, Reservation } from '@/lib/stay/types';

type CalendarAdminViewProps = {
	initialApartments: Apartment[];
	initialReservations: Reservation[];
	initialBlocks: CalendarBlock[];
};

type ReservationDraft = {
	id?: string;
	apartmentId: string;
	guestName: string;
	guestEmail: string;
	guestPhone: string;
	checkIn: string;
	checkOut: string;
	checkInTime: string;
	checkOutTime: string;
	guests: string;
	source: Reservation['source'];
	status: Reservation['status'];
	notes: string;
};

const weekdayHeadings = ['Pon', 'Uto', 'Sre', 'Cet', 'Pet', 'Sub', 'Ned'];

function startOfMonthGrid(anchor: string) {
	const date = fromIsoDate(anchor);
	date.setDate(1);
	date.setDate(1 - ((date.getDay() + 6) % 7)); // Monday-first

	return toIsoDate(date);
}

function formatLongDate(isoDate: string) {
	return new Intl.DateTimeFormat('sr-RS', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(fromIsoDate(isoDate));
}

function CalendarAdminView({ initialApartments, initialReservations, initialBlocks }: CalendarAdminViewProps) {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const today = toIsoDate(new Date());

	const [apartments] = useState(initialApartments);
	const [reservations, setReservations] = useState(initialReservations);
	const [blocks, setBlocks] = useState(initialBlocks);
	const [apartmentFilter, setApartmentFilter] = useState('all');
	const [monthAnchor, setMonthAnchor] = useState(today);
	const [selectedDay, setSelectedDay] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [busyKey, setBusyKey] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [draft, setDraft] = useState<ReservationDraft | null>(null);

	const visibleApartments = useMemo(
		() =>
			apartmentFilter === 'all' ? apartments : apartments.filter((apartment) => apartment.id === apartmentFilter),
		[apartmentFilter, apartments]
	);

	const cells = useMemo(() => {
		const start = startOfMonthGrid(monthAnchor);

		return Array.from({ length: 42 }, (_, index) => addDays(start, index));
	}, [monthAnchor]);

	const overviewFor = useCallback(
		(day: string) => dayOverview(visibleApartments, day, reservations, blocks),
		[blocks, reservations, visibleApartments]
	);

	const selected = selectedDay ? overviewFor(selectedDay) : null;

	function shiftMonth(direction: 1 | -1) {
		const date = fromIsoDate(monthAnchor);
		date.setDate(1);
		date.setMonth(date.getMonth() + direction);
		setMonthAnchor(toIsoDate(date));
	}

	/** One tap closes a free day and reopens a day that we blocked ourselves. */
	async function toggleDay(apartment: Apartment, day: string) {
		const key = `${apartment.id}-${day}`;
		const current = apartmentDay(apartment, day, reservations, blocks);
		setBusyKey(key);

		try {
			if (current.block) {
				const response = await fetch(`/api/stay/calendar-blocks/${current.block.id}`, { method: 'DELETE' });

				if (!response.ok) {
					setFeedback({ type: 'error', message: 'Dan nije otvoren.' });
					return;
				}

				setBlocks((list) => list.filter((item) => item.id !== current.block?.id));
				setFeedback({ type: 'success', message: 'Dan je otvoren za rezervacije.' });
				return;
			}

			const response = await fetch('/api/stay/calendar-blocks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					apartmentId: apartment.id,
					title: 'Zatvoreno',
					start: day,
					end: addDays(day, 1),
					type: 'maintenance',
					notes: ''
				})
			});

			if (!response.ok) {
				setFeedback({ type: 'error', message: 'Dan nije zatvoren.' });
				return;
			}

			const block = (await response.json()) as CalendarBlock;
			setBlocks((list) => [...list, block]);
			setFeedback({ type: 'success', message: 'Dan je zatvoren.' });
		} finally {
			setBusyKey(null);
		}
	}

	function openNewReservation(apartment: Apartment, day: string) {
		setDraft({
			apartmentId: apartment.id,
			guestName: '',
			guestEmail: '',
			guestPhone: '',
			checkIn: day,
			checkOut: addDays(day, 1),
			checkInTime: apartment.checkInFrom || '14:00',
			checkOutTime: apartment.checkOutUntil || '11:00',
			guests: '2',
			source: 'direct',
			status: 'confirmed',
			notes: ''
		});
	}

	function openReservation(reservation: Reservation) {
		const apartment = apartments.find((item) => item.id === reservation.apartmentId);

		setDraft({
			id: reservation.id,
			apartmentId: reservation.apartmentId,
			guestName: reservation.guestName,
			guestEmail: reservation.guestEmail,
			guestPhone: reservation.guestPhone,
			checkIn: reservation.checkIn,
			checkOut: reservation.checkOut,
			checkInTime: reservation.checkInTime || apartment?.checkInFrom || '14:00',
			checkOutTime: reservation.checkOutTime || apartment?.checkOutUntil || '11:00',
			guests: `${reservation.guests}`,
			source: reservation.source,
			status: reservation.status,
			notes: reservation.notes || ''
		});
	}

	async function saveReservation() {
		if (!draft) {
			return;
		}

		setSaving(true);

		const response = await fetch(draft.id ? `/api/stay/reservations/${draft.id}` : '/api/stay/reservations', {
			method: draft.id ? 'PATCH' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				apartmentId: draft.apartmentId,
				guestName: draft.guestName,
				guestEmail: draft.guestEmail,
				guestPhone: draft.guestPhone,
				checkIn: draft.checkIn,
				checkOut: draft.checkOut,
				checkInTime: draft.checkInTime,
				checkOutTime: draft.checkOutTime,
				guests: Number(draft.guests),
				source: draft.source,
				status: draft.status,
				notes: draft.notes
			})
		});

		setSaving(false);

		if (!response.ok) {
			const body = await response.json().catch(() => null);
			setFeedback({
				type: 'error',
				message: typeof body?.error === 'string' ? body.error : 'Rezervacija nije sacuvana.'
			});
			return;
		}

		const reservation = (await response.json()) as Reservation;

		setReservations((list) =>
			draft.id ? list.map((item) => (item.id === reservation.id ? reservation : item)) : [...list, reservation]
		);
		setDraft(null);
		setFeedback({ type: 'success', message: 'Rezervacija je sacuvana.' });
	}

	async function deleteReservation() {
		if (!draft?.id) {
			return;
		}

		const response = await fetch(`/api/stay/reservations/${draft.id}`, { method: 'DELETE' });

		if (!response.ok) {
			setFeedback({ type: 'error', message: 'Brisanje nije uspelo.' });
			return;
		}

		setReservations((list) => list.filter((item) => item.id !== draft.id));
		setDraft(null);
		setFeedback({ type: 'success', message: 'Rezervacija je obrisana.' });
	}

	const draftApartment = apartments.find((apartment) => apartment.id === draft?.apartmentId);
	const draftNights = draft && draft.checkOut > draft.checkIn ? getNights(draft.checkIn, draft.checkOut) : 0;
	const draftTotal =
		draftApartment && draftNights ? draftApartment.pricePerNight * draftNights + draftApartment.cleaningFee : 0;

	const monthLabel = new Intl.DateTimeFormat('sr-RS', { month: 'long', year: 'numeric' }).format(
		fromIsoDate(monthAnchor)
	);

	return (
		<Stack
			spacing={2}
			sx={{ minHeight: { md: 'calc(100svh - 6rem)' } }}
		>
			<PageHeader
				eyebrow="Operacije"
				title="Kalendar"
				description="Dodirni dan za pregled po apartmanu, sa tacnim vremenima ulaska i izlaska."
			/>

			<Paper sx={{ ...adminSurface, p: { xs: 1, md: 2 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
				<Stack
					direction="row"
					alignItems="center"
					spacing={1}
					sx={{ mb: 1.5 }}
				>
					<IconButton
						onClick={() => shiftMonth(-1)}
						aria-label="Prethodni mesec"
					>
						<ChevronLeftIcon />
					</IconButton>
					<Typography
						fontWeight={700}
						textTransform="capitalize"
						sx={{ flex: 1, textAlign: 'center', fontSize: { xs: '1rem', md: '1.15rem' } }}
					>
						{monthLabel}
					</Typography>
					<IconButton
						onClick={() => shiftMonth(1)}
						aria-label="Sledeci mesec"
					>
						<ChevronRightIcon />
					</IconButton>
				</Stack>

				<Stack
					direction="row"
					spacing={1}
					sx={{ mb: 1.5 }}
				>
					<Button
						size="small"
						variant="outlined"
						onClick={() => setMonthAnchor(today)}
						sx={{ flexShrink: 0 }}
					>
						Danas
					</Button>
					<TextField
						select
						size="small"
						value={apartmentFilter}
						onChange={(event) => setApartmentFilter(event.target.value)}
						sx={{ flex: 1 }}
					>
						<MenuItem value="all">Svi apartmani</MenuItem>
						{apartments.map((apartment) => (
							<MenuItem
								key={apartment.id}
								value={apartment.id}
							>
								{apartment.name}
							</MenuItem>
						))}
					</TextField>
				</Stack>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
						gap: { xs: 0.35, md: 0.75 },
						mb: 0.5
					}}
				>
					{weekdayHeadings.map((heading) => (
						<Typography
							key={heading}
							variant="caption"
							fontWeight={700}
							color="text.secondary"
							textAlign="center"
						>
							{heading}
						</Typography>
					))}
				</Box>

				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
						gridAutoRows: { xs: 'minmax(3.4rem, 1fr)', md: 'minmax(5rem, 1fr)' },
						gap: { xs: 0.35, md: 0.75 },
						flex: 1
					}}
				>
					{cells.map((day) => {
						const overview = overviewFor(day);
						const outside = day.slice(0, 7) !== monthAnchor.slice(0, 7);
						const past = day < today;
						const ratio = overview.total ? overview.freeCount / overview.total : 0;
						const tone =
							ratio === 0
								? { bg: 'rgba(239, 68, 68, 0.14)', fg: '#b91c1c' }
								: ratio === 1
									? { bg: 'rgba(16, 185, 129, 0.14)', fg: '#047857' }
									: { bg: 'rgba(245, 158, 11, 0.16)', fg: '#b45309' };

						return (
							<Box
								key={day}
								role="button"
								tabIndex={0}
								onClick={() => setSelectedDay(day)}
								onKeyDown={(event) => event.key === 'Enter' && setSelectedDay(day)}
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'flex-start',
									gap: 0.4,
									p: { xs: 0.5, md: 1 },
									borderRadius: 2,
									cursor: 'pointer',
									border: '1px solid',
									borderColor: day === today ? 'primary.main' : 'divider',
									borderWidth: day === today ? 2 : 1,
									// Past days read as archive: flat, grey, no availability colour.
									backgroundColor: past ? 'action.disabledBackground' : 'background.paper',
									opacity: outside ? 0.35 : past ? 0.6 : 1,
									transition: 'box-shadow 120ms ease',
									'&:hover': { boxShadow: past ? 0 : 3 }
								}}
							>
								<Typography
									variant="body2"
									fontWeight={day === today ? 800 : 600}
									color={past ? 'text.disabled' : 'text.primary'}
								>
									{Number(day.slice(8, 10))}
								</Typography>

								{past || overview.total === 0 ? null : (
									<>
										<Box
											sx={{
												fontSize: { xs: 9, md: 10 },
												fontWeight: 800,
												borderRadius: 999,
												px: 0.6,
												color: tone.fg,
												backgroundColor: tone.bg,
												lineHeight: 1.6
											}}
										>
											{overview.freeCount}/{overview.total}
										</Box>
										<Stack
											direction="row"
											spacing={0.3}
											justifyContent="center"
											flexWrap="wrap"
											useFlexGap
										>
											{overview.rows.slice(0, 4).map((row) => (
												<Box
													key={row.apartment.id}
													sx={{
														width: 6,
														height: 6,
														borderRadius: '50%',
														backgroundColor: stateColors[row.state]
													}}
												/>
											))}
										</Stack>
									</>
								)}
							</Box>
						);
					})}
				</Box>

				<Stack
					direction="row"
					flexWrap="wrap"
					gap={0.75}
					sx={{ mt: 1.5 }}
				>
					{(Object.keys(stateLabels) as (keyof typeof stateLabels)[]).map((state) => (
						<Stack
							key={state}
							direction="row"
							spacing={0.5}
							alignItems="center"
						>
							<Box
								sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: stateColors[state] }}
							/>
							<Typography
								variant="caption"
								color="text.secondary"
							>
								{stateLabels[state]}
							</Typography>
						</Stack>
					))}
				</Stack>
			</Paper>

			{/* Day sheet: bottom on phones, side panel on desktop */}
			<Drawer
				anchor={isMobile ? 'bottom' : 'right'}
				open={Boolean(selected)}
				onClose={() => setSelectedDay(null)}
				slotProps={{
					paper: {
						sx: {
							width: { xs: '100%', md: 460 },
							maxHeight: { xs: '88svh', md: '100%' },
							borderTopLeftRadius: { xs: 16, md: 0 },
							borderTopRightRadius: { xs: 16, md: 0 },
							p: 2
						}
					}
				}}
			>
				{selected ? (
					<Stack
						spacing={2}
						sx={{ overflowY: 'auto' }}
					>
						<Stack
							direction="row"
							justifyContent="space-between"
							alignItems="flex-start"
						>
							<div>
								<Typography
									variant="h6"
									fontWeight={700}
									textTransform="capitalize"
								>
									{formatLongDate(selected.day)}
								</Typography>
								<Stack
									direction="row"
									spacing={0.75}
									marginTop={0.75}
									flexWrap="wrap"
									useFlexGap
								>
									<Chip
										size="small"
										color={selected.freeCount ? 'success' : 'default'}
										label={`Slobodno ${selected.freeCount}/${selected.total}`}
									/>
									<Chip
										size="small"
										variant="outlined"
										label={`Dolasci ${selected.arrivals}`}
									/>
									<Chip
										size="small"
										variant="outlined"
										label={`Odlasci ${selected.departures}`}
									/>
								</Stack>
							</div>
							<IconButton
								onClick={() => setSelectedDay(null)}
								aria-label="Zatvori"
							>
								<CloseIcon />
							</IconButton>
						</Stack>

						<Divider />

						<Stack spacing={1.5}>
							{selected.rows.map((row) => (
								<Paper
									key={row.apartment.id}
									variant="outlined"
									sx={{ p: 1.5, borderRadius: 2 }}
								>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
									>
										<Box
											sx={{
												width: 10,
												height: 10,
												borderRadius: '50%',
												flexShrink: 0,
												backgroundColor: stateColors[row.state]
											}}
										/>
										<Typography
											fontWeight={700}
											sx={{ flex: 1 }}
											noWrap
										>
											{row.apartment.name}
										</Typography>
										<StatusPill
											status={row.state === 'blocked' ? 'cleaning' : 'confirmed'}
											label={stateLabels[row.state]}
										/>
									</Stack>

									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mt: 0.75 }}
									>
										{row.label}
									</Typography>

									{row.stay ? (
										<Typography
											variant="caption"
											color="text.secondary"
											display="block"
											sx={{ mt: 0.5 }}
										>
											{row.stay.guestName} · {sourceLabels[row.stay.source]} ·{' '}
											{statusLabels[row.stay.status]}
										</Typography>
									) : null}

									<Stack
										direction="row"
										spacing={1}
										sx={{ mt: 1.25 }}
										flexWrap="wrap"
										useFlexGap
									>
										{row.stay ? (
											<Button
												size="small"
												variant="outlined"
												onClick={() => openReservation(row.stay!)}
											>
												Otvori rezervaciju
											</Button>
										) : null}

										{row.state === 'free' || row.state === 'departure' ? (
											<Button
												size="small"
												variant="contained"
												startIcon={<AddIcon />}
												onClick={() => openNewReservation(row.apartment, selected.day)}
											>
												Rezervisi
											</Button>
										) : null}

										{row.stay ? null : (
											<Button
												size="small"
												color={row.block ? 'success' : 'warning'}
												variant="outlined"
												disabled={busyKey === `${row.apartment.id}-${selected.day}`}
												startIcon={row.block ? <LockOpenIcon /> : <LockIcon />}
												onClick={() => toggleDay(row.apartment, selected.day)}
											>
												{row.block ? 'Otvori dan' : 'Zatvori dan'}
											</Button>
										)}
									</Stack>
								</Paper>
							))}
						</Stack>
					</Stack>
				) : null}
			</Drawer>

			{/* Reservation editor */}
			<Dialog
				open={Boolean(draft)}
				onClose={() => setDraft(null)}
				maxWidth="sm"
				fullWidth
				fullScreen={isMobile}
			>
				<DialogTitle>{draft?.id ? 'Izmeni rezervaciju' : 'Nova rezervacija'}</DialogTitle>
				<DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
					{draft ? (
						<>
							<TextField
								select
								label="Apartman"
								value={draft.apartmentId}
								onChange={(event) => setDraft({ ...draft, apartmentId: event.target.value })}
							>
								{apartments.map((apartment) => (
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
								value={draft.guestName}
								onChange={(event) => setDraft({ ...draft, guestName: event.target.value })}
							/>
							<Stack
								direction={{ xs: 'column', sm: 'row' }}
								spacing={2}
							>
								<TextField
									label="Email"
									fullWidth
									value={draft.guestEmail}
									onChange={(event) => setDraft({ ...draft, guestEmail: event.target.value })}
								/>
								<TextField
									label="Telefon"
									fullWidth
									value={draft.guestPhone}
									onChange={(event) => setDraft({ ...draft, guestPhone: event.target.value })}
								/>
							</Stack>
							<Stack
								direction="row"
								spacing={2}
							>
								<TextField
									label="Dolazak"
									type="date"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
									value={draft.checkIn}
									onChange={(event) => setDraft({ ...draft, checkIn: event.target.value })}
								/>
								<TextField
									label="Od (sat)"
									type="time"
									sx={{ width: 130 }}
									slotProps={{ inputLabel: { shrink: true } }}
									value={draft.checkInTime}
									onChange={(event) => setDraft({ ...draft, checkInTime: event.target.value })}
								/>
							</Stack>
							<Stack
								direction="row"
								spacing={2}
							>
								<TextField
									label="Odlazak"
									type="date"
									fullWidth
									slotProps={{ inputLabel: { shrink: true } }}
									value={draft.checkOut}
									onChange={(event) => setDraft({ ...draft, checkOut: event.target.value })}
								/>
								<TextField
									label="Do (sat)"
									type="time"
									sx={{ width: 130 }}
									slotProps={{ inputLabel: { shrink: true } }}
									value={draft.checkOutTime}
									onChange={(event) => setDraft({ ...draft, checkOutTime: event.target.value })}
								/>
							</Stack>
							<Stack
								direction="row"
								spacing={2}
							>
								<TextField
									label="Gostiju"
									type="number"
									fullWidth
									value={draft.guests}
									onChange={(event) => setDraft({ ...draft, guests: event.target.value })}
								/>
								<TextField
									select
									label="Izvor"
									fullWidth
									value={draft.source}
									onChange={(event) =>
										setDraft({ ...draft, source: event.target.value as Reservation['source'] })
									}
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
							</Stack>
							<TextField
								select
								label="Status"
								value={draft.status}
								onChange={(event) =>
									setDraft({ ...draft, status: event.target.value as Reservation['status'] })
								}
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
							{draftNights ? (
								<Alert severity="info">
									{draftNights} noci · {formatCurrency(draftTotal)} sa ciscenjem
								</Alert>
							) : null}
							<TextField
								label="Napomena"
								multiline
								minRows={2}
								value={draft.notes}
								onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
							/>
						</>
					) : null}
				</DialogContent>
				<DialogActions>
					{draft?.id ? (
						<Button
							color="error"
							onClick={deleteReservation}
						>
							Obrisi
						</Button>
					) : null}
					<Button onClick={() => setDraft(null)}>Odustani</Button>
					<Button
						variant="contained"
						onClick={saveReservation}
						disabled={saving}
					>
						Sacuvaj
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={Boolean(feedback)}
				autoHideDuration={3500}
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

export default CalendarAdminView;
