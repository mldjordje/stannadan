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
	FormControlLabel,
	Grid,
	IconButton,
	MenuItem,
	Paper,
	Snackbar,
	Stack,
	Switch,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/EventBusyOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import TodayIcon from '@mui/icons-material/TodayOutlined';
import StayTimeline, { type TimelineSelection } from '@/components/admin/StayTimeline';
import { PageHeader, StatCard, StatusPill, adminSurface } from '@/components/admin/ui';
import {
	addDays,
	blockColors,
	blockLabels,
	coversNight,
	fromIsoDate,
	nextStatus,
	nextStatusLabels,
	sourceLabels,
	statusColors,
	statusLabels,
	toIsoDate
} from '@/lib/stay/labels';
import { formatCurrency, getNights } from '@/lib/stay/format';
import { Apartment, CalendarBlock, Reservation } from '@/lib/stay/types';

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
	guests: string;
	source: Reservation['source'];
	status: Reservation['status'];
	notes: string;
};

type BlockDraft = {
	id?: string;
	apartmentId: string;
	title: string;
	start: string;
	end: string;
	type: CalendarBlock['type'];
	notes: string;
};

const emptyReservationDraft: ReservationDraft = {
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

const emptyBlockDraft: BlockDraft = {
	apartmentId: '',
	title: '',
	start: '',
	end: '',
	type: 'cleaning',
	notes: ''
};

const rangePresets = [
	{ value: 14, label: '2 nedelje' },
	{ value: 30, label: 'Mesec' },
	{ value: 60, label: '2 meseca' }
];

function formatLongDate(isoDate: string) {
	return new Intl.DateTimeFormat('sr-RS', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(fromIsoDate(isoDate));
}

function startOfMonthGrid(anchor: string) {
	const date = fromIsoDate(anchor);
	date.setDate(1);
	const weekday = (date.getDay() + 6) % 7; // Monday-first
	date.setDate(1 - weekday);

	return toIsoDate(date);
}

function CalendarAdminView({ initialApartments, initialReservations, initialBlocks }: CalendarAdminViewProps) {
	const today = toIsoDate(new Date());
	const [apartments] = useState(initialApartments);
	const [reservations, setReservations] = useState(initialReservations);
	const [blocks, setBlocks] = useState(initialBlocks);
	const [apartmentFilter, setApartmentFilter] = useState('all');
	const [sourceFilter, setSourceFilter] = useState('all');
	const [showCancelled, setShowCancelled] = useState(false);
	const [mode, setMode] = useState<'timeline' | 'month'>('timeline');
	const [dayCount, setDayCount] = useState(30);
	const [rangeStart, setRangeStart] = useState(today);
	const [monthAnchor, setMonthAnchor] = useState(today);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [dialogMode, setDialogMode] = useState<'reservation' | 'block' | null>(null);
	const [selectedDay, setSelectedDay] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const [reservationDraft, setReservationDraft] = useState<ReservationDraft>({
		...emptyReservationDraft,
		apartmentId: initialApartments[0]?.id || ''
	});
	const [blockDraft, setBlockDraft] = useState<BlockDraft>({
		...emptyBlockDraft,
		apartmentId: initialApartments[0]?.id || ''
	});

	const visibleApartments = useMemo(
		() =>
			apartmentFilter === 'all' ? apartments : apartments.filter((apartment) => apartment.id === apartmentFilter),
		[apartmentFilter, apartments]
	);

	const visibleReservations = useMemo(
		() =>
			reservations.filter(
				(reservation) =>
					(apartmentFilter === 'all' || reservation.apartmentId === apartmentFilter) &&
					(sourceFilter === 'all' || reservation.source === sourceFilter) &&
					(showCancelled || reservation.status !== 'cancelled')
			),
		[apartmentFilter, reservations, showCancelled, sourceFilter]
	);

	const visibleBlocks = useMemo(
		() => blocks.filter((block) => apartmentFilter === 'all' || block.apartmentId === apartmentFilter),
		[apartmentFilter, blocks]
	);

	/** Everything that happens on a single day, used by the day drawer, the cells and the stats. */
	const buildDaySummary = useCallback(
		(day: string) => {
			const arrivals = visibleReservations.filter((reservation) => reservation.checkIn === day);
			const departures = visibleReservations.filter((reservation) => reservation.checkOut === day);
			const staying = visibleReservations.filter(
				(reservation) =>
					reservation.status !== 'cancelled' && coversNight(reservation.checkIn, reservation.checkOut, day)
			);
			const dayBlocks = visibleBlocks.filter((block) => coversNight(block.start, block.end, day));
			const occupiedApartmentIds = new Set([
				...staying.map((reservation) => reservation.apartmentId),
				...dayBlocks.map((block) => block.apartmentId)
			]);
			const freeApartments = visibleApartments.filter((apartment) => !occupiedApartmentIds.has(apartment.id));
			const revenue = staying.reduce(
				(total, reservation) =>
					total + reservation.totalPrice / getNights(reservation.checkIn, reservation.checkOut),
				0
			);

			return {
				day,
				arrivals,
				departures,
				staying,
				blocks: dayBlocks,
				freeApartments,
				occupiedCount: occupiedApartmentIds.size,
				totalApartments: visibleApartments.length,
				revenue
			};
		},
		[visibleApartments, visibleBlocks, visibleReservations]
	);

	const daySummary = useMemo(
		() => (selectedDay ? buildDaySummary(selectedDay) : null),
		[buildDaySummary, selectedDay]
	);

	const headlineStats = useMemo(() => {
		const todaySummary = buildDaySummary(today);
		const occupancy = todaySummary.totalApartments
			? Math.round((todaySummary.occupiedCount / todaySummary.totalApartments) * 100)
			: 0;
		const windowDays = Array.from({ length: dayCount }, (_, index) => addDays(rangeStart, index));
		const windowOccupancy = windowDays.reduce((total, day) => {
			const summary = buildDaySummary(day);

			return total + (summary.totalApartments ? summary.occupiedCount / summary.totalApartments : 0);
		}, 0);
		const windowRevenue = windowDays.reduce((total, day) => total + buildDaySummary(day).revenue, 0);
		const pending = visibleReservations.filter((reservation) => reservation.status === 'pending').length;

		return [
			{ label: 'Popunjenost danas', value: `${occupancy}%`, tone: occupancy > 70 ? 'positive' : 'neutral' },
			{ label: 'Dolasci danas', value: `${todaySummary.arrivals.length}`, tone: 'accent' },
			{ label: 'Odlasci danas', value: `${todaySummary.departures.length}`, tone: 'neutral' },
			{
				label: 'Slobodno danas',
				value: `${todaySummary.freeApartments.length}/${todaySummary.totalApartments}`,
				tone: 'neutral'
			},
			{ label: 'Ceka potvrdu', value: `${pending}`, tone: pending ? 'warning' : 'neutral' },
			{
				label: `Popunjenost ${dayCount} dana`,
				value: `${dayCount ? Math.round((windowOccupancy / dayCount) * 100) : 0}%`,
				hint: `Prihod ${formatCurrency(Math.round(windowRevenue))}`,
				tone: 'positive'
			}
		] as const;
	}, [buildDaySummary, dayCount, rangeStart, today, visibleReservations]);

	const monthCells = useMemo(() => {
		const start = startOfMonthGrid(monthAnchor);

		return Array.from({ length: 42 }, (_, index) => addDays(start, index));
	}, [monthAnchor]);

	function openNewReservation(prefill?: { checkIn?: string; checkOut?: string; apartmentId?: string }) {
		setReservationDraft({
			...emptyReservationDraft,
			apartmentId:
				prefill?.apartmentId || (apartmentFilter === 'all' ? apartments[0]?.id || '' : apartmentFilter),
			checkIn: prefill?.checkIn || '',
			checkOut: prefill?.checkOut || (prefill?.checkIn ? addDays(prefill.checkIn, 1) : '')
		});
		setDialogMode('reservation');
	}

	function openNewBlock(prefill?: { start?: string; end?: string; apartmentId?: string }) {
		setBlockDraft({
			...emptyBlockDraft,
			apartmentId:
				prefill?.apartmentId || (apartmentFilter === 'all' ? apartments[0]?.id || '' : apartmentFilter),
			start: prefill?.start || '',
			end: prefill?.end || '',
			title: prefill ? 'Nova blokada' : ''
		});
		setDialogMode('block');
	}

	function openReservation(reservation: Reservation) {
		setReservationDraft({
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
		});
		setDialogMode('reservation');
	}

	function openBlock(block: CalendarBlock) {
		setBlockDraft({
			id: block.id,
			apartmentId: block.apartmentId,
			title: block.title,
			start: block.start,
			end: block.end,
			type: block.type,
			notes: block.notes || ''
		});
		setDialogMode('block');
	}

	const onTimelineSelect = useCallback((selection: TimelineSelection) => {
		setReservationDraft({
			...emptyReservationDraft,
			apartmentId: selection.apartmentId,
			checkIn: selection.start,
			checkOut: selection.end
		});
		setDialogMode('reservation');
	}, []);

	function shiftRange(direction: 1 | -1) {
		if (mode === 'month') {
			const anchor = fromIsoDate(monthAnchor);
			anchor.setDate(1);
			anchor.setMonth(anchor.getMonth() + direction);
			setMonthAnchor(toIsoDate(anchor));
			return;
		}

		setRangeStart((current) => addDays(current, direction * Math.round(dayCount / 2)));
	}

	function jumpToToday() {
		setRangeStart(today);
		setMonthAnchor(today);
	}

	const draftApartment = apartments.find((apartment) => apartment.id === reservationDraft.apartmentId);
	const draftNights =
		reservationDraft.checkIn && reservationDraft.checkOut && reservationDraft.checkOut > reservationDraft.checkIn
			? getNights(reservationDraft.checkIn, reservationDraft.checkOut)
			: 0;
	const draftTotal =
		draftApartment && draftNights ? draftApartment.pricePerNight * draftNights + draftApartment.cleaningFee : 0;

	/** Warns before saving over an existing stay in the same apartment. */
	const draftConflict = useMemo(() => {
		if (!reservationDraft.checkIn || !reservationDraft.checkOut) {
			return null;
		}

		const overlapping = reservations.find(
			(reservation) =>
				reservation.id !== reservationDraft.id &&
				reservation.apartmentId === reservationDraft.apartmentId &&
				reservation.status !== 'cancelled' &&
				reservation.checkIn < reservationDraft.checkOut &&
				reservationDraft.checkIn < reservation.checkOut
		);

		if (overlapping) {
			return `Preklapa se sa rezervacijom: ${overlapping.guestName}.`;
		}

		const overlappingBlock = blocks.find(
			(block) =>
				block.id !== blockDraft.id &&
				block.apartmentId === reservationDraft.apartmentId &&
				block.start < reservationDraft.checkOut &&
				reservationDraft.checkIn < block.end
		);

		return overlappingBlock ? `Preklapa se sa blokadom: ${overlappingBlock.title}.` : null;
	}, [blockDraft.id, blocks, reservationDraft, reservations]);

	async function saveReservation() {
		setSaving(true);

		const response = await fetch(
			reservationDraft.id ? `/api/stay/reservations/${reservationDraft.id}` : '/api/stay/reservations',
			{
				method: reservationDraft.id ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					apartmentId: reservationDraft.apartmentId,
					guestName: reservationDraft.guestName,
					guestEmail: reservationDraft.guestEmail,
					guestPhone: reservationDraft.guestPhone,
					checkIn: reservationDraft.checkIn,
					checkOut: reservationDraft.checkOut,
					guests: Number(reservationDraft.guests),
					source: reservationDraft.source,
					status: reservationDraft.status,
					notes: reservationDraft.notes
				})
			}
		);

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

		setReservations((current) =>
			reservationDraft.id
				? current.map((item) => (item.id === reservation.id ? reservation : item))
				: [...current, reservation]
		);
		setDialogMode(null);
		setFeedback({ type: 'success', message: 'Rezervacija je sacuvana.' });
	}

	async function saveBlock() {
		setSaving(true);

		const response = await fetch(
			blockDraft.id ? `/api/stay/calendar-blocks/${blockDraft.id}` : '/api/stay/calendar-blocks',
			{
				method: blockDraft.id ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(blockDraft)
			}
		);

		setSaving(false);

		if (!response.ok) {
			setFeedback({ type: 'error', message: 'Blokada nije sacuvana.' });
			return;
		}

		const block = (await response.json()) as CalendarBlock;

		setBlocks((current) =>
			blockDraft.id ? current.map((item) => (item.id === block.id ? block : item)) : [...current, block]
		);
		setDialogMode(null);
		setFeedback({ type: 'success', message: 'Kalendar blokada je sacuvana.' });
	}

	async function deleteCurrentDialogItem() {
		if (dialogMode === 'reservation' && reservationDraft.id) {
			const response = await fetch(`/api/stay/reservations/${reservationDraft.id}`, { method: 'DELETE' });

			if (response.ok) {
				setReservations((current) => current.filter((item) => item.id !== reservationDraft.id));
				setDialogMode(null);
				setFeedback({ type: 'success', message: 'Rezervacija je obrisana.' });
			}
		}

		if (dialogMode === 'block' && blockDraft.id) {
			const response = await fetch(`/api/stay/calendar-blocks/${blockDraft.id}`, { method: 'DELETE' });

			if (response.ok) {
				setBlocks((current) => current.filter((item) => item.id !== blockDraft.id));
				setDialogMode(null);
				setFeedback({ type: 'success', message: 'Blokada je obrisana.' });
			}
		}
	}

	async function setReservationStatus(reservation: Reservation, status: Reservation['status']) {
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
		setFeedback({ type: 'success', message: `Status je promenjen na "${statusLabels[status]}".` });
	}

	function apartmentName(apartmentId: string) {
		return apartments.find((apartment) => apartment.id === apartmentId)?.name || apartmentId;
	}

	const rangeLabel =
		mode === 'month'
			? new Intl.DateTimeFormat('sr-RS', { month: 'long', year: 'numeric' }).format(fromIsoDate(monthAnchor))
			: `${formatLongDate(rangeStart).replace(/^\S+\s/, '')} → ${formatLongDate(addDays(rangeStart, dayCount - 1)).replace(/^\S+\s/, '')}`;

	return (
		<Stack
			spacing={3}
			padding={{ xs: 0, md: 1 }}
		>
			<PageHeader
				eyebrow="Operacije"
				title="Kalendar zauzetosti"
				description="Prevuci preko praznih polja da otvoris novu rezervaciju, klikni traku da je izmenis, klikni datum za dnevni pregled."
				actions={
					<>
						<Button
							variant="outlined"
							startIcon={<BlockIcon />}
							onClick={() => openNewBlock()}
						>
							Blokada
						</Button>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={() => openNewReservation()}
						>
							Rezervacija
						</Button>
					</>
				}
			/>

			<Grid
				container
				spacing={2}
			>
				{headlineStats.map((stat) => (
					<Grid
						key={stat.label}
						size={{ xs: 6, md: 4, xl: 2 }}
					>
						<StatCard
							label={stat.label}
							value={stat.value}
							hint={'hint' in stat ? stat.hint : undefined}
							tone={stat.tone}
						/>
					</Grid>
				))}
			</Grid>

			<Paper sx={{ ...adminSurface, p: { xs: 1.5, md: 2.5 } }}>
				<Stack
					direction={{ xs: 'column', lg: 'row' }}
					spacing={2}
					justifyContent="space-between"
					alignItems={{ lg: 'center' }}
					marginBottom={2}
				>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
						flexWrap="wrap"
						useFlexGap
					>
						<IconButton
							onClick={() => shiftRange(-1)}
							aria-label="Prethodni period"
						>
							<ChevronLeftIcon />
						</IconButton>
						<IconButton
							onClick={() => shiftRange(1)}
							aria-label="Sledeci period"
						>
							<ChevronRightIcon />
						</IconButton>
						<Button
							size="small"
							startIcon={<TodayIcon />}
							onClick={jumpToToday}
						>
							Danas
						</Button>
						<Typography
							fontWeight={700}
							textTransform="capitalize"
							sx={{ ml: 1 }}
						>
							{rangeLabel}
						</Typography>
					</Stack>

					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
						flexWrap="wrap"
						useFlexGap
					>
						<ToggleButtonGroup
							size="small"
							exclusive
							value={mode}
							onChange={(_, value) => value && setMode(value)}
						>
							<ToggleButton value="timeline">Timeline</ToggleButton>
							<ToggleButton value="month">Mesec</ToggleButton>
						</ToggleButtonGroup>
						{mode === 'timeline' ? (
							<ToggleButtonGroup
								size="small"
								exclusive
								value={dayCount}
								onChange={(_, value) => value && setDayCount(value)}
							>
								{rangePresets.map((preset) => (
									<ToggleButton
										key={preset.value}
										value={preset.value}
									>
										{preset.label}
									</ToggleButton>
								))}
							</ToggleButtonGroup>
						) : null}
						<TextField
							select
							label="Apartman"
							value={apartmentFilter}
							onChange={(event) => setApartmentFilter(event.target.value)}
							sx={{ minWidth: 180 }}
							size="small"
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
						<TextField
							select
							label="Izvor"
							value={sourceFilter}
							onChange={(event) => setSourceFilter(event.target.value)}
							sx={{ minWidth: 150 }}
							size="small"
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
						<FormControlLabel
							control={
								<Switch
									size="small"
									checked={showCancelled}
									onChange={(event) => setShowCancelled(event.target.checked)}
								/>
							}
							label="Otkazane"
						/>
					</Stack>
				</Stack>

				<Stack
					direction="row"
					flexWrap="wrap"
					gap={1}
					marginBottom={2}
				>
					{Object.entries(statusLabels).map(([status, label]) => (
						<Chip
							key={status}
							size="small"
							label={label}
							sx={{ backgroundColor: statusColors[status as Reservation['status']], color: '#fff' }}
						/>
					))}
					{Object.entries(blockLabels).map(([type, label]) => (
						<Chip
							key={type}
							size="small"
							variant="outlined"
							label={label}
							sx={{
								borderColor: blockColors[type as CalendarBlock['type']],
								color: blockColors[type as CalendarBlock['type']]
							}}
						/>
					))}
				</Stack>

				{mode === 'timeline' ? (
					<StayTimeline
						apartments={visibleApartments}
						reservations={visibleReservations}
						blocks={visibleBlocks}
						rangeStart={rangeStart}
						dayCount={dayCount}
						onSelectRange={onTimelineSelect}
						onOpenReservation={openReservation}
						onOpenBlock={openBlock}
						onOpenDay={setSelectedDay}
					/>
				) : (
					<Box>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
								gap: 0.5,
								mb: 0.5
							}}
						>
							{['Pon', 'Uto', 'Sre', 'Cet', 'Pet', 'Sub', 'Ned'].map((label) => (
								<Typography
									key={label}
									variant="caption"
									fontWeight={700}
									color="text.secondary"
									textAlign="center"
								>
									{label}
								</Typography>
							))}
						</Box>
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
								gap: 0.5
							}}
						>
							{monthCells.map((day) => {
								const summary = buildDaySummary(day);
								const outside = day.slice(0, 7) !== monthAnchor.slice(0, 7);
								const ratio = summary.totalApartments
									? summary.occupiedCount / summary.totalApartments
									: 0;
								const tone =
									ratio === 0
										? { bg: 'rgba(16, 185, 129, 0.12)', fg: '#047857' }
										: ratio >= 1
											? { bg: 'rgba(239, 68, 68, 0.12)', fg: '#b91c1c' }
											: { bg: 'rgba(245, 158, 11, 0.14)', fg: '#b45309' };

								return (
									<Box
										key={day}
										role="button"
										tabIndex={0}
										onClick={() => setSelectedDay(day)}
										onKeyDown={(event) => event.key === 'Enter' && setSelectedDay(day)}
										sx={{
											minHeight: { xs: 84, md: 112 },
											p: 1,
											borderRadius: 2,
											cursor: 'pointer',
											border: '1px solid',
											borderColor: day === today ? 'primary.main' : 'divider',
											opacity: outside ? 0.45 : 1,
											backgroundColor: 'background.paper',
											transition: 'box-shadow 120ms ease',
											'&:hover': { boxShadow: 3 }
										}}
									>
										<Stack
											direction="row"
											justifyContent="space-between"
											alignItems="center"
										>
											<Typography
												variant="body2"
												fontWeight={day === today ? 800 : 600}
											>
												{Number(day.slice(8, 10))}
											</Typography>
											{summary.totalApartments ? (
												<Box
													sx={{
														fontSize: 10,
														fontWeight: 700,
														borderRadius: 999,
														px: 0.75,
														py: '1px',
														color: tone.fg,
														backgroundColor: tone.bg
													}}
												>
													{summary.freeApartments.length}/{summary.totalApartments}
												</Box>
											) : null}
										</Stack>
										<Stack
											spacing={0.25}
											mt={0.5}
										>
											{summary.staying.slice(0, 3).map((reservation) => (
												<Box
													key={reservation.id}
													sx={{
														fontSize: 10,
														fontWeight: 700,
														color: '#fff',
														backgroundColor: statusColors[reservation.status],
														borderRadius: 0.75,
														px: 0.5,
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													}}
												>
													{reservation.guestName}
												</Box>
											))}
											{summary.staying.length > 3 ? (
												<Typography
													variant="caption"
													color="text.secondary"
												>
													+{summary.staying.length - 3}
												</Typography>
											) : null}
										</Stack>
									</Box>
								);
							})}
						</Box>
					</Box>
				)}
			</Paper>

			{/* Day drawer */}
			<Drawer
				anchor="right"
				open={Boolean(daySummary)}
				onClose={() => setSelectedDay(null)}
				slotProps={{ paper: { sx: { width: { xs: '100%', sm: 440 }, p: 2.5 } } }}
			>
				{daySummary ? (
					<Stack spacing={2}>
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
									{formatLongDate(daySummary.day)}
								</Typography>
								<Stack
									direction="row"
									flexWrap="wrap"
									gap={0.75}
									marginTop={1}
								>
									<Chip
										size="small"
										label={`Zauzeto ${daySummary.occupiedCount}/${daySummary.totalApartments}`}
									/>
									<Chip
										size="small"
										color="success"
										label={`Slobodno ${daySummary.freeApartments.length}`}
									/>
									<Chip
										size="small"
										variant="outlined"
										label={`Prihod ${formatCurrency(Math.round(daySummary.revenue))}`}
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

						<section>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Dolasci ({daySummary.arrivals.length})
							</Typography>
							{daySummary.arrivals.length === 0 ? (
								<Typography variant="body2">Nema prijava ovog dana.</Typography>
							) : (
								<Stack spacing={1}>
									{daySummary.arrivals.map((reservation) => (
										<Paper
											key={reservation.id}
											variant="outlined"
											sx={{ p: 1.5, borderRadius: 2 }}
										>
											<Stack
												direction="row"
												justifyContent="space-between"
												alignItems="center"
												spacing={1}
											>
												<div>
													<Typography fontWeight={600}>{reservation.guestName}</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{apartmentName(reservation.apartmentId)} · {reservation.guests}{' '}
														gostiju · {sourceLabels[reservation.source]}
													</Typography>
												</div>
												<StatusPill
													status={reservation.status}
													label={statusLabels[reservation.status]}
												/>
											</Stack>
											<Stack
												direction="row"
												spacing={1}
												marginTop={1}
											>
												{nextStatus[reservation.status] ? (
													<Button
														size="small"
														variant="outlined"
														onClick={() =>
															setReservationStatus(
																reservation,
																nextStatus[reservation.status]!
															)
														}
													>
														{nextStatusLabels[reservation.status]}
													</Button>
												) : null}
												<Button
													size="small"
													onClick={() => openReservation(reservation)}
												>
													Otvori
												</Button>
											</Stack>
										</Paper>
									))}
								</Stack>
							)}
						</section>

						<Divider />

						<section>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Odlasci ({daySummary.departures.length})
							</Typography>
							{daySummary.departures.length === 0 ? (
								<Typography variant="body2">Nema odjava ovog dana.</Typography>
							) : (
								<Stack spacing={1}>
									{daySummary.departures.map((reservation) => (
										<Paper
											key={reservation.id}
											variant="outlined"
											sx={{ p: 1.5, borderRadius: 2 }}
										>
											<Stack
												direction="row"
												justifyContent="space-between"
												alignItems="center"
												spacing={1}
											>
												<div>
													<Typography fontWeight={600}>{reservation.guestName}</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
													>
														{apartmentName(reservation.apartmentId)}
													</Typography>
												</div>
												<Button
													size="small"
													onClick={() =>
														openNewBlock({
															start: daySummary.day,
															end: addDays(daySummary.day, 1),
															apartmentId: reservation.apartmentId
														})
													}
												>
													Ciscenje
												</Button>
											</Stack>
										</Paper>
									))}
								</Stack>
							)}
						</section>

						<Divider />

						<section>
							<Typography
								variant="subtitle2"
								color="text.secondary"
								gutterBottom
							>
								Stanje po apartmanu
							</Typography>
							<Stack spacing={1}>
								{visibleApartments.map((apartment) => {
									const stay = daySummary.staying.find(
										(reservation) => reservation.apartmentId === apartment.id
									);
									const block = daySummary.blocks.find((item) => item.apartmentId === apartment.id);

									return (
										<Stack
											key={apartment.id}
											direction="row"
											justifyContent="space-between"
											alignItems="center"
											spacing={1}
										>
											<Typography variant="body2">{apartment.name}</Typography>
											{stay ? (
												<StatusPill
													status={stay.status}
													label={stay.guestName}
													onClick={() => openReservation(stay)}
												/>
											) : block ? (
												<StatusPill
													status={block.type}
													label={blockLabels[block.type]}
													onClick={() => openBlock(block)}
												/>
											) : (
												<Button
													size="small"
													variant="outlined"
													onClick={() =>
														openNewReservation({
															checkIn: daySummary.day,
															apartmentId: apartment.id
														})
													}
												>
													Slobodno · rezervisi
												</Button>
											)}
										</Stack>
									);
								})}
							</Stack>
						</section>

						<Stack
							direction="row"
							spacing={1}
							flexWrap="wrap"
							useFlexGap
						>
							<Button
								variant="outlined"
								onClick={() => openNewBlock({ start: daySummary.day, end: addDays(daySummary.day, 1) })}
							>
								Blokiraj dan
							</Button>
							<Button
								variant="contained"
								onClick={() =>
									openNewReservation({
										checkIn: daySummary.day,
										apartmentId: daySummary.freeApartments[0]?.id
									})
								}
							>
								Nova rezervacija
							</Button>
						</Stack>
					</Stack>
				) : null}
			</Drawer>

			{/* Reservation dialog */}
			<Dialog
				open={dialogMode === 'reservation'}
				onClose={() => setDialogMode(null)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>{reservationDraft.id ? 'Izmeni rezervaciju' : 'Nova rezervacija'}</DialogTitle>
				<DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
					{draftConflict ? <Alert severity="warning">{draftConflict}</Alert> : null}
					<TextField
						select
						label="Apartman"
						value={reservationDraft.apartmentId}
						onChange={(event) =>
							setReservationDraft((current) => ({ ...current, apartmentId: event.target.value }))
						}
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
						value={reservationDraft.guestName}
						onChange={(event) =>
							setReservationDraft((current) => ({ ...current, guestName: event.target.value }))
						}
					/>
					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
					>
						<TextField
							label="Email"
							fullWidth
							value={reservationDraft.guestEmail}
							onChange={(event) =>
								setReservationDraft((current) => ({ ...current, guestEmail: event.target.value }))
							}
						/>
						<TextField
							label="Telefon"
							fullWidth
							value={reservationDraft.guestPhone}
							onChange={(event) =>
								setReservationDraft((current) => ({ ...current, guestPhone: event.target.value }))
							}
						/>
					</Stack>
					<Stack
						direction="row"
						spacing={2}
					>
						<TextField
							label="Check-in"
							type="date"
							slotProps={{ inputLabel: { shrink: true } }}
							value={reservationDraft.checkIn}
							onChange={(event) =>
								setReservationDraft((current) => ({ ...current, checkIn: event.target.value }))
							}
							fullWidth
						/>
						<TextField
							label="Check-out"
							type="date"
							slotProps={{ inputLabel: { shrink: true } }}
							value={reservationDraft.checkOut}
							onChange={(event) =>
								setReservationDraft((current) => ({ ...current, checkOut: event.target.value }))
							}
							fullWidth
						/>
					</Stack>
					<Stack
						direction="row"
						spacing={2}
					>
						<TextField
							label="Broj gostiju"
							type="number"
							value={reservationDraft.guests}
							onChange={(event) =>
								setReservationDraft((current) => ({ ...current, guests: event.target.value }))
							}
							fullWidth
						/>
						<TextField
							select
							label="Izvor"
							value={reservationDraft.source}
							onChange={(event) =>
								setReservationDraft((current) => ({
									...current,
									source: event.target.value as Reservation['source']
								}))
							}
							fullWidth
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
							value={reservationDraft.status}
							onChange={(event) =>
								setReservationDraft((current) => ({
									...current,
									status: event.target.value as Reservation['status']
								}))
							}
							fullWidth
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
					{draftNights ? (
						<Alert severity="info">
							{draftNights} noci · {formatCurrency(draftTotal)} (ukljucuje ciscenje)
						</Alert>
					) : null}
					<TextField
						label="Napomena"
						value={reservationDraft.notes}
						onChange={(event) =>
							setReservationDraft((current) => ({ ...current, notes: event.target.value }))
						}
						multiline
						minRows={3}
					/>
				</DialogContent>
				<DialogActions>
					{reservationDraft.id ? (
						<Button
							color="error"
							onClick={deleteCurrentDialogItem}
						>
							Obrisi
						</Button>
					) : null}
					<Button onClick={() => setDialogMode(null)}>Odustani</Button>
					<Button
						onClick={saveReservation}
						variant="contained"
						disabled={saving}
					>
						Sacuvaj
					</Button>
				</DialogActions>
			</Dialog>

			{/* Block dialog */}
			<Dialog
				open={dialogMode === 'block'}
				onClose={() => setDialogMode(null)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>{blockDraft.id ? 'Izmeni blokadu' : 'Nova blokada'}</DialogTitle>
				<DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
					<TextField
						select
						label="Apartman"
						value={blockDraft.apartmentId}
						onChange={(event) =>
							setBlockDraft((current) => ({ ...current, apartmentId: event.target.value }))
						}
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
						label="Naslov"
						value={blockDraft.title}
						onChange={(event) => setBlockDraft((current) => ({ ...current, title: event.target.value }))}
					/>
					<Stack
						direction="row"
						spacing={2}
					>
						<TextField
							label="Pocetak"
							type="date"
							slotProps={{ inputLabel: { shrink: true } }}
							value={blockDraft.start}
							onChange={(event) =>
								setBlockDraft((current) => ({ ...current, start: event.target.value }))
							}
							fullWidth
						/>
						<TextField
							label="Kraj"
							type="date"
							slotProps={{ inputLabel: { shrink: true } }}
							value={blockDraft.end}
							onChange={(event) => setBlockDraft((current) => ({ ...current, end: event.target.value }))}
							fullWidth
						/>
					</Stack>
					<TextField
						select
						label="Tip blokade"
						value={blockDraft.type}
						onChange={(event) =>
							setBlockDraft((current) => ({
								...current,
								type: event.target.value as CalendarBlock['type']
							}))
						}
					>
						{Object.entries(blockLabels).map(([type, label]) => (
							<MenuItem
								key={type}
								value={type}
							>
								{label}
							</MenuItem>
						))}
					</TextField>
					<TextField
						label="Napomena"
						value={blockDraft.notes}
						onChange={(event) => setBlockDraft((current) => ({ ...current, notes: event.target.value }))}
						multiline
						minRows={3}
					/>
				</DialogContent>
				<DialogActions>
					{blockDraft.id ? (
						<Button
							color="error"
							onClick={deleteCurrentDialogItem}
						>
							Obrisi
						</Button>
					) : null}
					<Button onClick={() => setDialogMode(null)}>Odustani</Button>
					<Button
						onClick={saveBlock}
						variant="contained"
						disabled={saving}
					>
						Sacuvaj
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
					onClose={() => setFeedback(null)}
					variant="filled"
				>
					{feedback?.message}
				</Alert>
			</Snackbar>
		</Stack>
	);
}

export default CalendarAdminView;
