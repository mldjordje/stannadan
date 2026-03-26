'use client';

import { useMemo, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Paper,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
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

function CalendarAdminView({ initialApartments, initialReservations, initialBlocks }: CalendarAdminViewProps) {
	const [apartments] = useState(initialApartments);
	const [reservations, setReservations] = useState(initialReservations);
	const [blocks, setBlocks] = useState(initialBlocks);
	const [apartmentFilter, setApartmentFilter] = useState('all');
	const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
	const [dialogMode, setDialogMode] = useState<'reservation' | 'block' | null>(null);
	const [reservationDraft, setReservationDraft] = useState<ReservationDraft>({
		...emptyReservationDraft,
		apartmentId: initialApartments[0]?.id || ''
	});
	const [blockDraft, setBlockDraft] = useState<BlockDraft>({
		...emptyBlockDraft,
		apartmentId: initialApartments[0]?.id || ''
	});

	const events = useMemo(() => {
		const reservationEvents = reservations
			.filter((reservation) => apartmentFilter === 'all' || reservation.apartmentId === apartmentFilter)
			.map((reservation) => ({
				id: reservation.id,
				title: `${reservation.guestName} • ${reservation.source}`,
				start: reservation.checkIn,
				end: reservation.checkOut,
				backgroundColor: reservation.source === 'booking.com' ? '#ec4899' : '#10b981',
				borderColor: reservation.source === 'booking.com' ? '#ec4899' : '#10b981',
				extendedProps: {
					kind: 'reservation',
					apartmentId: reservation.apartmentId
				}
			}));

		const blockEvents = blocks
			.filter((block) => apartmentFilter === 'all' || block.apartmentId === apartmentFilter)
			.map((block) => ({
				id: block.id,
				title: block.title,
				start: block.start,
				end: block.end,
				backgroundColor: block.type === 'maintenance' ? '#f97316' : '#64748b',
				borderColor: block.type === 'maintenance' ? '#f97316' : '#64748b',
				extendedProps: {
					kind: 'block',
					apartmentId: block.apartmentId
				}
			}));

		return [...reservationEvents, ...blockEvents];
	}, [apartmentFilter, blocks, reservations]);

	function openNewReservation() {
		setReservationDraft({
			...emptyReservationDraft,
			apartmentId: apartmentFilter === 'all' ? initialApartments[0]?.id || '' : apartmentFilter
		});
		setDialogMode('reservation');
	}

	function openNewBlock(selectInfo?: DateSelectArg) {
		setBlockDraft({
			...emptyBlockDraft,
			apartmentId: apartmentFilter === 'all' ? initialApartments[0]?.id || '' : apartmentFilter,
			start: selectInfo?.startStr || '',
			end: selectInfo?.endStr || '',
			title: selectInfo ? 'Nova blokada' : ''
		});
		setDialogMode('block');
	}

	function editEvent(info: EventClickArg) {
		const kind = info.event.extendedProps.kind as 'reservation' | 'block';

		if (kind === 'reservation') {
			const reservation = reservations.find((item) => item.id === info.event.id);

			if (!reservation) {
				return;
			}

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
			return;
		}

		const block = blocks.find((item) => item.id === info.event.id);

		if (!block) {
			return;
		}

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

	async function onEventDrop(info: EventDropArg) {
		const kind = info.event.extendedProps.kind as 'reservation' | 'block';
		const payload = kind === 'reservation'
			? {
					checkIn: info.event.startStr.slice(0, 10),
					checkOut: info.event.endStr.slice(0, 10)
				}
			: {
					start: info.event.startStr.slice(0, 10),
					end: info.event.endStr.slice(0, 10)
				};

		const response = await fetch(
			kind === 'reservation' ? `/api/stay/reservations/${info.event.id}` : `/api/stay/calendar-blocks/${info.event.id}`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			}
		);

		if (!response.ok) {
			info.revert();
			setFeedback({ type: 'error', message: 'Promena termina nije uspela.' });
			return;
		}

		if (kind === 'reservation') {
			const updated = (await response.json()) as Reservation;
			setReservations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
		} else {
			const updated = (await response.json()) as CalendarBlock;
			setBlocks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
		}

		setFeedback({ type: 'success', message: 'Termin je pomeren u kalendaru.' });
	}

	async function saveReservation() {
		const response = await fetch(reservationDraft.id ? `/api/stay/reservations/${reservationDraft.id}` : '/api/stay/reservations', {
			method: reservationDraft.id ? 'PATCH' : 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
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
		});

		if (!response.ok) {
			setFeedback({ type: 'error', message: 'Rezervacija nije sacuvana.' });
			return;
		}

		const reservation = (await response.json()) as Reservation;

		setReservations((current) =>
			reservationDraft.id ? current.map((item) => (item.id === reservation.id ? reservation : item)) : [...current, reservation]
		);
		setDialogMode(null);
		setFeedback({ type: 'success', message: 'Rezervacija je sacuvana.' });
	}

	async function saveBlock() {
		const response = await fetch(blockDraft.id ? `/api/stay/calendar-blocks/${blockDraft.id}` : '/api/stay/calendar-blocks', {
			method: blockDraft.id ? 'PATCH' : 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(blockDraft)
		});

		if (!response.ok) {
			setFeedback({ type: 'error', message: 'Blokada nije sacuvana.' });
			return;
		}

		const block = (await response.json()) as CalendarBlock;

		setBlocks((current) => (blockDraft.id ? current.map((item) => (item.id === block.id ? block : item)) : [...current, block]));
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

	return (
		<Stack spacing={3} padding={3}>
			<div>
				<Typography variant="h4" fontWeight={700}>
					Interaktivni kalendar
				</Typography>
				<Typography color="text.secondary">Pomeraj rezervacije, otvaraj blokade i drzi sve kanale na jednom rasporedu.</Typography>
			</div>

			{feedback ? <Alert severity={feedback.type}>{feedback.message}</Alert> : null}

			<Paper sx={{ borderRadius: 4, p: 3 }}>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }} marginBottom={3}>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<TextField
							select
							label="Filter po apartmanu"
							value={apartmentFilter}
							onChange={(event) => setApartmentFilter(event.target.value)}
							sx={{ minWidth: 260 }}
						>
							<MenuItem value="all">Svi apartmani</MenuItem>
							{apartments.map((apartment) => (
								<MenuItem key={apartment.id} value={apartment.id}>
									{apartment.name}
								</MenuItem>
							))}
						</TextField>
					</Stack>
					<Stack direction="row" spacing={2}>
						<Button variant="outlined" onClick={() => openNewBlock()}>
							Nova blokada
						</Button>
						<Button variant="contained" onClick={openNewReservation}>
							Nova rezervacija
						</Button>
					</Stack>
				</Stack>
				<FullCalendar
					plugins={[dayGridPlugin, interactionPlugin]}
					initialView="dayGridMonth"
					height="auto"
					headerToolbar={{
						left: 'prev,next today',
						center: 'title',
						right: ''
					}}
					selectable
					editable
					select={(selection) => openNewBlock(selection)}
					eventClick={editEvent}
					eventDrop={onEventDrop}
					events={events}
				/>
			</Paper>

			<Dialog open={dialogMode === 'reservation'} onClose={() => setDialogMode(null)} maxWidth="sm" fullWidth>
				<DialogTitle>{reservationDraft.id ? 'Izmeni rezervaciju' : 'Nova rezervacija'}</DialogTitle>
				<DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
					<TextField
						select
						label="Apartman"
						value={reservationDraft.apartmentId}
						onChange={(event) => setReservationDraft((current) => ({ ...current, apartmentId: event.target.value }))}
					>
						{apartments.map((apartment) => (
							<MenuItem key={apartment.id} value={apartment.id}>
								{apartment.name}
							</MenuItem>
						))}
					</TextField>
					<TextField label="Gost" value={reservationDraft.guestName} onChange={(event) => setReservationDraft((current) => ({ ...current, guestName: event.target.value }))} />
					<TextField label="Email" value={reservationDraft.guestEmail} onChange={(event) => setReservationDraft((current) => ({ ...current, guestEmail: event.target.value }))} />
					<TextField label="Telefon" value={reservationDraft.guestPhone} onChange={(event) => setReservationDraft((current) => ({ ...current, guestPhone: event.target.value }))} />
					<Stack direction="row" spacing={2}>
						<TextField
							label="Check-in"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={reservationDraft.checkIn}
							onChange={(event) => setReservationDraft((current) => ({ ...current, checkIn: event.target.value }))}
							fullWidth
						/>
						<TextField
							label="Check-out"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={reservationDraft.checkOut}
							onChange={(event) => setReservationDraft((current) => ({ ...current, checkOut: event.target.value }))}
							fullWidth
						/>
					</Stack>
					<Stack direction="row" spacing={2}>
						<TextField label="Broj gostiju" type="number" value={reservationDraft.guests} onChange={(event) => setReservationDraft((current) => ({ ...current, guests: event.target.value }))} fullWidth />
						<TextField
							select
							label="Izvor"
							value={reservationDraft.source}
							onChange={(event) => setReservationDraft((current) => ({ ...current, source: event.target.value as Reservation['source'] }))}
							fullWidth
						>
							<MenuItem value="direct">Direct</MenuItem>
							<MenuItem value="booking.com">Booking.com</MenuItem>
							<MenuItem value="manual">Manual</MenuItem>
						</TextField>
						<TextField
							select
							label="Status"
							value={reservationDraft.status}
							onChange={(event) => setReservationDraft((current) => ({ ...current, status: event.target.value as Reservation['status'] }))}
							fullWidth
						>
							<MenuItem value="pending">Pending</MenuItem>
							<MenuItem value="confirmed">Confirmed</MenuItem>
							<MenuItem value="checked-in">Checked-in</MenuItem>
							<MenuItem value="checked-out">Checked-out</MenuItem>
							<MenuItem value="cancelled">Cancelled</MenuItem>
						</TextField>
					</Stack>
					<TextField
						label="Napomena"
						value={reservationDraft.notes}
						onChange={(event) => setReservationDraft((current) => ({ ...current, notes: event.target.value }))}
						multiline
						minRows={3}
					/>
				</DialogContent>
				<DialogActions>
					{reservationDraft.id ? (
						<Button color="error" onClick={deleteCurrentDialogItem}>
							Obrisi
						</Button>
					) : null}
					<Button onClick={() => setDialogMode(null)}>Odustani</Button>
					<Button onClick={saveReservation} variant="contained">
						Sacuvaj
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={dialogMode === 'block'} onClose={() => setDialogMode(null)} maxWidth="sm" fullWidth>
				<DialogTitle>{blockDraft.id ? 'Izmeni blokadu' : 'Nova blokada'}</DialogTitle>
				<DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
					<TextField
						select
						label="Apartman"
						value={blockDraft.apartmentId}
						onChange={(event) => setBlockDraft((current) => ({ ...current, apartmentId: event.target.value }))}
					>
						{apartments.map((apartment) => (
							<MenuItem key={apartment.id} value={apartment.id}>
								{apartment.name}
							</MenuItem>
						))}
					</TextField>
					<TextField label="Naslov" value={blockDraft.title} onChange={(event) => setBlockDraft((current) => ({ ...current, title: event.target.value }))} />
					<Stack direction="row" spacing={2}>
						<TextField
							label="Pocetak"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={blockDraft.start}
							onChange={(event) => setBlockDraft((current) => ({ ...current, start: event.target.value }))}
							fullWidth
						/>
						<TextField
							label="Kraj"
							type="date"
							InputLabelProps={{ shrink: true }}
							value={blockDraft.end}
							onChange={(event) => setBlockDraft((current) => ({ ...current, end: event.target.value }))}
							fullWidth
						/>
					</Stack>
					<TextField
						select
						label="Tip blokade"
						value={blockDraft.type}
						onChange={(event) => setBlockDraft((current) => ({ ...current, type: event.target.value as CalendarBlock['type'] }))}
					>
						<MenuItem value="cleaning">Cleaning</MenuItem>
						<MenuItem value="maintenance">Maintenance</MenuItem>
						<MenuItem value="owner-stay">Owner stay</MenuItem>
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
						<Button color="error" onClick={deleteCurrentDialogItem}>
							Obrisi
						</Button>
					) : null}
					<Button onClick={() => setDialogMode(null)}>Odustani</Button>
					<Button onClick={saveBlock} variant="contained">
						Sacuvaj
					</Button>
				</DialogActions>
			</Dialog>
		</Stack>
	);
}

export default CalendarAdminView;
