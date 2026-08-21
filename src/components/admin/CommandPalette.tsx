'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	Box,
	Dialog,
	InputAdornment,
	List,
	ListItemButton,
	ListItemText,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import { formatDateRange } from '@/lib/stay/format';
import { statusLabels } from '@/lib/stay/labels';
import type { Apartment, Reservation } from '@/lib/stay/types';

type Command = {
	id: string;
	group: string;
	title: string;
	subtitle?: string;
	href: string;
};

const pageCommands: Command[] = [
	{ id: 'page-dashboard', group: 'Stranice', title: 'Pregled', href: '/admin' },
	{ id: 'page-calendar', group: 'Stranice', title: 'Kalendar', href: '/admin/calendar' },
	{ id: 'page-reservations', group: 'Stranice', title: 'Rezervacije', href: '/admin/reservations' },
	{ id: 'page-guests', group: 'Stranice', title: 'Gosti', href: '/admin/guests' },
	{ id: 'page-analytics', group: 'Stranice', title: 'Analitika', href: '/admin/analytics' },
	{ id: 'page-apartments', group: 'Stranice', title: 'Apartmani', href: '/admin/apartments' },
	{ id: 'page-sync', group: 'Stranice', title: 'Booking sync', href: '/admin/channel-sync' },
	{ id: 'page-users', group: 'Stranice', title: 'Korisnici', href: '/admin/users' }
];

/**
 * Ctrl/Cmd+K jump bar over pages, reservations and apartments.
 * Data is fetched once on first open and kept for the session.
 */
export default function CommandPalette() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [highlight, setHighlight] = useState(0);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [apartments, setApartments] = useState<Apartment[]>([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
				event.preventDefault();
				setOpen((current) => !current);
			}
		}

		function onOpenRequest() {
			setOpen(true);
		}

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('admin:open-command-palette', onOpenRequest);

		return () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('admin:open-command-palette', onOpenRequest);
		};
	}, []);

	useEffect(() => {
		if (!open || loaded) {
			return;
		}

		setLoaded(true);

		Promise.all([
			fetch('/api/stay/reservations')
				.then((response) => (response.ok ? response.json() : []))
				.catch(() => []),
			fetch('/api/stay/apartments')
				.then((response) => (response.ok ? response.json() : []))
				.catch(() => [])
		]).then(([reservationList, apartmentList]) => {
			setReservations(Array.isArray(reservationList) ? reservationList : []);
			setApartments(Array.isArray(apartmentList) ? apartmentList : []);
		});
	}, [loaded, open]);

	const commands = useMemo(() => {
		const apartmentCommands: Command[] = apartments.map((apartment) => ({
			id: `apartment-${apartment.id}`,
			group: 'Apartmani',
			title: apartment.name,
			subtitle: `${apartment.guests} gostiju · ${apartment.pricePerNight} EUR`,
			href: '/admin/apartments'
		}));

		const reservationCommands: Command[] = reservations.map((reservation) => ({
			id: `reservation-${reservation.id}`,
			group: 'Rezervacije',
			title: reservation.guestName,
			subtitle: `${formatDateRange(reservation.checkIn, reservation.checkOut)} · ${statusLabels[reservation.status]}`,
			href: '/admin/reservations'
		}));

		return [...pageCommands, ...apartmentCommands, ...reservationCommands];
	}, [apartments, reservations]);

	const results = useMemo(() => {
		const term = query.trim().toLowerCase();

		if (!term) {
			return pageCommands;
		}

		return commands
			.filter((command) => `${command.title} ${command.subtitle || ''}`.toLowerCase().includes(term))
			.slice(0, 20);
	}, [commands, query]);

	useEffect(() => {
		setHighlight(0);
	}, [query, open]);

	function run(command: Command) {
		setOpen(false);
		setQuery('');
		router.push(command.href);
	}

	function onKeyDown(event: React.KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setHighlight((current) => Math.min(current + 1, results.length - 1));
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			setHighlight((current) => Math.max(current - 1, 0));
		}

		if (event.key === 'Enter' && results[highlight]) {
			event.preventDefault();
			run(results[highlight]);
		}
	}

	return (
		<Dialog
			open={open}
			onClose={() => setOpen(false)}
			maxWidth="sm"
			fullWidth
			slotProps={{ paper: { sx: { borderRadius: 3, mt: '10vh', alignSelf: 'flex-start' } } }}
		>
			<Box sx={{ p: 2, pb: 1 }}>
				<TextField
					autoFocus
					fullWidth
					size="small"
					placeholder="Pretrazi stranice, goste, apartmane..."
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					onKeyDown={onKeyDown}
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
			</Box>
			<List
				dense
				sx={{ maxHeight: '50vh', overflowY: 'auto', pt: 0 }}
			>
				{results.length === 0 ? (
					<Typography
						color="text.secondary"
						sx={{ px: 3, py: 3 }}
					>
						Nema rezultata.
					</Typography>
				) : (
					results.map((command, index) => (
						<ListItemButton
							key={command.id}
							selected={index === highlight}
							onMouseEnter={() => setHighlight(index)}
							onClick={() => run(command)}
						>
							<ListItemText
								primary={
									<Stack
										direction="row"
										justifyContent="space-between"
										spacing={1}
									>
										<Typography
											variant="body2"
											fontWeight={600}
										>
											{command.title}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{command.group}
										</Typography>
									</Stack>
								}
								secondary={command.subtitle}
							/>
						</ListItemButton>
					))
				)}
			</List>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}
			>
				↑↓ za kretanje · Enter za otvaranje · Ctrl+K za zatvaranje
			</Typography>
		</Dialog>
	);
}
