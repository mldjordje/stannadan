import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/ApartmentOutlined';
import CleaningIcon from '@mui/icons-material/CleaningServicesOutlined';
import LoginIcon from '@mui/icons-material/LoginOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PendingIcon from '@mui/icons-material/PendingActionsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import { EmptyState, PageHeader, SectionCard, StatCard, StatusPill } from '@/components/admin/ui';
import { addDays, blockLabels, coversNight, sourceLabels, statusLabels, toIsoDate } from '@/lib/stay/labels';
import { formatCurrency, formatDateRange, getNights } from '@/lib/stay/format';
import { getAdminContext, scopeStayData } from '@/lib/auth/requireAdmin';
import { readStayData } from '@/lib/stay/store';
import type { Reservation } from '@/lib/stay/types';

/** Revenue attributed to a single night of a stay, so partial months are counted fairly. */
function nightlyValue(reservation: Reservation) {
	return reservation.totalPrice / getNights(reservation.checkIn, reservation.checkOut);
}

export default async function AdminDashboardPage() {
	const context = await getAdminContext();

	if (!context) {
		redirect('/sign-in');
	}

	const data = scopeStayData(await readStayData(), context);
	const today = toIsoDate(new Date());
	const active = data.reservations.filter((reservation) => reservation.status !== 'cancelled');

	const pendingReservations = data.reservations.filter((reservation) => reservation.status === 'pending');
	const arrivalsToday = active.filter((reservation) => reservation.checkIn === today);
	const departuresToday = active.filter((reservation) => reservation.checkOut === today);
	const cleaningToday = data.calendarBlocks.filter(
		(block) => block.type === 'cleaning' && coversNight(block.start, block.end, today)
	);
	const inHouse = active.filter((reservation) => coversNight(reservation.checkIn, reservation.checkOut, today));
	const occupiedToday = new Set([
		...inHouse.map((reservation) => reservation.apartmentId),
		...data.calendarBlocks
			.filter((block) => coversNight(block.start, block.end, today))
			.map((block) => block.apartmentId)
	]);

	/** Occupancy for the next two weeks, used by the strip chart. */
	const forecast = Array.from({ length: 14 }, (_, index) => {
		const day = addDays(today, index);
		const busy = new Set([
			...active
				.filter((reservation) => coversNight(reservation.checkIn, reservation.checkOut, day))
				.map((reservation) => reservation.apartmentId),
			...data.calendarBlocks
				.filter((block) => coversNight(block.start, block.end, day))
				.map((block) => block.apartmentId)
		]);

		return {
			day,
			ratio: data.apartments.length ? busy.size / data.apartments.length : 0,
			occupied: busy.size
		};
	});

	const monthStart = `${today.slice(0, 7)}-01`;
	const monthDays = Array.from({ length: 31 }, (_, index) => addDays(monthStart, index)).filter(
		(day) => day.slice(0, 7) === today.slice(0, 7)
	);
	const monthRevenue = monthDays.reduce(
		(total, day) =>
			total +
			active
				.filter((reservation) => coversNight(reservation.checkIn, reservation.checkOut, day))
				.reduce((sum, reservation) => sum + nightlyValue(reservation), 0),
		0
	);
	const soldNights = monthDays.reduce(
		(total, day) =>
			total + active.filter((reservation) => coversNight(reservation.checkIn, reservation.checkOut, day)).length,
		0
	);
	const averageRate = soldNights ? monthRevenue / soldNights : 0;
	const monthOccupancy = data.apartments.length ? soldNights / (monthDays.length * data.apartments.length) : 0;

	const upcoming = [...active]
		.filter((reservation) => reservation.checkIn >= today)
		.sort((first, second) => first.checkIn.localeCompare(second.checkIn));

	/** Per-apartment performance over the next 30 nights. */
	const window30 = Array.from({ length: 30 }, (_, index) => addDays(today, index));
	const apartmentStats = data.apartments.map((apartment) => {
		const nights = window30.filter((day) =>
			active.some(
				(reservation) =>
					reservation.apartmentId === apartment.id &&
					coversNight(reservation.checkIn, reservation.checkOut, day)
			)
		).length;
		const revenue = window30.reduce(
			(total, day) =>
				total +
				active
					.filter(
						(reservation) =>
							reservation.apartmentId === apartment.id &&
							coversNight(reservation.checkIn, reservation.checkOut, day)
					)
					.reduce((sum, reservation) => sum + nightlyValue(reservation), 0),
			0
		);

		return { apartment, nights, revenue, occupancy: nights / window30.length };
	});

	function apartmentName(apartmentId: string) {
		return data.apartments.find((apartment) => apartment.id === apartmentId)?.name || apartmentId;
	}

	return (
		<Stack
			spacing={3}
			padding={{ xs: 0, md: 1 }}
		>
			<PageHeader
				eyebrow="Stan na dan Nis"
				title={`Dobar dan, ${context.displayName.split(' ')[0]}`}
				description={
					context.role === 'admin'
						? 'Dnevni operativni pregled: dolasci, odlasci, ciscenje, prihod i popunjenost.'
						: 'Pregled tvojih apartmana: rezervacije, kalendar i dostupnost.'
				}
				actions={
					<>
						<Button
							component={Link}
							href="/admin/calendar"
							variant="contained"
						>
							Otvori kalendar
						</Button>
						{context.role === 'admin' ? (
							<Button
								component={Link}
								href="/admin/channel-sync"
								variant="outlined"
							>
								Booking sync
							</Button>
						) : null}
					</>
				}
			/>

			<Grid
				container
				spacing={2}
			>
				<Grid size={{ xs: 6, md: 4, xl: 2 }}>
					<StatCard
						label="Zauzeto danas"
						value={`${occupiedToday.size}/${data.apartments.length}`}
						hint={`${Math.round(
							data.apartments.length ? (occupiedToday.size / data.apartments.length) * 100 : 0
						)}% popunjenosti`}
						tone="accent"
						icon={<ApartmentIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 4, xl: 2 }}>
					<StatCard
						label="Dolasci danas"
						value={arrivalsToday.length}
						tone="positive"
						icon={<LoginIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 4, xl: 2 }}>
					<StatCard
						label="Odlasci danas"
						value={departuresToday.length}
						tone="neutral"
						icon={<LogoutIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 4, xl: 2 }}>
					<StatCard
						label="Ciscenje danas"
						value={cleaningToday.length}
						tone="neutral"
						icon={<CleaningIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 4, xl: 2 }}>
					<StatCard
						label="Ceka potvrdu"
						value={pendingReservations.length}
						tone={pendingReservations.length ? 'warning' : 'neutral'}
						icon={<PendingIcon />}
					/>
				</Grid>
				<Grid size={{ xs: 6, md: 4, xl: 2 }}>
					<StatCard
						label="Prihod ovog meseca"
						value={formatCurrency(Math.round(monthRevenue))}
						hint={`Prosek noci ${formatCurrency(Math.round(averageRate))} · ${Math.round(monthOccupancy * 100)}% popunjeno`}
						tone="positive"
						icon={<TrendingUpIcon />}
					/>
				</Grid>
			</Grid>

			<SectionCard
				title="Popunjenost narednih 14 dana"
				subtitle="Svaka kolona je jedna noc. Klikni kalendar za detalje dana."
				action={
					<Button
						component={Link}
						href="/admin/calendar"
						size="small"
					>
						Kalendar
					</Button>
				}
			>
				<Stack
					direction="row"
					spacing={0.75}
					alignItems="flex-end"
					sx={{ overflowX: 'auto', pb: 1 }}
				>
					{forecast.map((entry) => (
						<Stack
							key={entry.day}
							alignItems="center"
							spacing={0.5}
							sx={{ minWidth: 34, flex: 1 }}
						>
							<Typography
								variant="caption"
								color="text.secondary"
								fontSize={10}
							>
								{Math.round(entry.ratio * 100)}%
							</Typography>
							<Box
								title={`${entry.occupied}/${data.apartments.length} zauzeto`}
								sx={{
									width: '100%',
									height: 96,
									borderRadius: 1.5,
									backgroundColor: 'action.hover',
									display: 'flex',
									alignItems: 'flex-end',
									overflow: 'hidden'
								}}
							>
								<Box
									sx={{
										width: '100%',
										height: `${Math.max(entry.ratio * 100, 3)}%`,
										backgroundColor:
											entry.ratio >= 1 ? '#ef4444' : entry.ratio >= 0.5 ? '#10b981' : '#f59e0b',
										transition: 'height 200ms ease'
									}}
								/>
							</Box>
							<Typography
								variant="caption"
								fontSize={10}
								color="text.secondary"
							>
								{Number(entry.day.slice(8, 10))}
							</Typography>
						</Stack>
					))}
				</Stack>
			</SectionCard>

			<Grid
				container
				spacing={3}
			>
				<Grid size={{ xs: 12, xl: 7 }}>
					<SectionCard
						title="Danas u objektu"
						subtitle="Dolasci, odlasci i zadaci ciscenja."
					>
						<Grid
							container
							spacing={2}
						>
							<Grid size={{ xs: 12, md: 4 }}>
								<Typography
									variant="caption"
									fontWeight={700}
									color="text.secondary"
								>
									DOLASCI ({arrivalsToday.length})
								</Typography>
								<Stack
									spacing={1}
									mt={1}
								>
									{arrivalsToday.length === 0 ? (
										<Typography variant="body2">Nema prijava.</Typography>
									) : (
										arrivalsToday.map((reservation) => (
											<Box key={reservation.id}>
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
													{apartmentName(reservation.apartmentId)}
												</Typography>
											</Box>
										))
									)}
								</Stack>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<Typography
									variant="caption"
									fontWeight={700}
									color="text.secondary"
								>
									ODLASCI ({departuresToday.length})
								</Typography>
								<Stack
									spacing={1}
									mt={1}
								>
									{departuresToday.length === 0 ? (
										<Typography variant="body2">Nema odjava.</Typography>
									) : (
										departuresToday.map((reservation) => (
											<Box key={reservation.id}>
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
													{apartmentName(reservation.apartmentId)}
												</Typography>
											</Box>
										))
									)}
								</Stack>
							</Grid>
							<Grid size={{ xs: 12, md: 4 }}>
								<Typography
									variant="caption"
									fontWeight={700}
									color="text.secondary"
								>
									ZADACI ({cleaningToday.length})
								</Typography>
								<Stack
									spacing={1}
									mt={1}
								>
									{cleaningToday.length === 0 ? (
										<Typography variant="body2">Nema zakazanih.</Typography>
									) : (
										cleaningToday.map((block) => (
											<Box key={block.id}>
												<Typography
													variant="body2"
													fontWeight={700}
												>
													{blockLabels[block.type]}
												</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{apartmentName(block.apartmentId)}
												</Typography>
											</Box>
										))
									)}
								</Stack>
							</Grid>
						</Grid>
					</SectionCard>
				</Grid>

				<Grid size={{ xs: 12, xl: 5 }}>
					<SectionCard
						title="Ceka potvrdu"
						subtitle="Rezervacije koje jos nisu potvrdjene."
						action={
							<Button
								component={Link}
								href="/admin/reservations"
								size="small"
							>
								Sve rezervacije
							</Button>
						}
					>
						{pendingReservations.length === 0 ? (
							<EmptyState
								title="Sve je potvrdjeno"
								hint="Nema rezervacija na cekanju."
							/>
						) : (
							<Stack spacing={1.5}>
								{pendingReservations.slice(0, 6).map((reservation) => (
									<Stack
										key={reservation.id}
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={1}
									>
										<div>
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
												{apartmentName(reservation.apartmentId)} ·{' '}
												{formatDateRange(reservation.checkIn, reservation.checkOut)}
											</Typography>
										</div>
										<StatusPill
											status={reservation.status}
											label={statusLabels[reservation.status]}
										/>
									</Stack>
								))}
							</Stack>
						)}
					</SectionCard>
				</Grid>

				<Grid size={{ xs: 12, xl: 7 }}>
					<SectionCard
						title="Sledeci dolasci"
						subtitle="Najblize rezervacije za operativni tim."
						action={
							<Button
								component={Link}
								href="/admin/reservations"
								size="small"
							>
								Sve
							</Button>
						}
					>
						{upcoming.length === 0 ? (
							<EmptyState title="Nema buducih rezervacija" />
						) : (
							<Stack spacing={1.5}>
								{upcoming.slice(0, 6).map((reservation) => (
									<Stack
										key={reservation.id}
										direction={{ xs: 'column', sm: 'row' }}
										justifyContent="space-between"
										spacing={1}
										sx={{
											borderBottom: '1px solid',
											borderColor: 'divider',
											pb: 1.25,
											'&:last-of-type': { borderBottom: 0, pb: 0 }
										}}
									>
										<div>
											<Typography fontWeight={700}>{reservation.guestName}</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
											>
												{apartmentName(reservation.apartmentId)} ·{' '}
												{sourceLabels[reservation.source]}
											</Typography>
										</div>
										<Stack
											alignItems={{ sm: 'flex-end' }}
											spacing={0.5}
										>
											<Typography
												variant="body2"
												fontWeight={700}
											>
												{formatDateRange(reservation.checkIn, reservation.checkOut)}
											</Typography>
											<StatusPill
												status={reservation.status}
												label={statusLabels[reservation.status]}
											/>
										</Stack>
									</Stack>
								))}
							</Stack>
						)}
					</SectionCard>
				</Grid>

				<Grid size={{ xs: 12, xl: 5 }}>
					<SectionCard
						title="Ucinak apartmana"
						subtitle="Narednih 30 noci: popunjenost i ocekivani prihod."
						action={
							<Button
								component={Link}
								href="/admin/apartments"
								size="small"
							>
								Uredi
							</Button>
						}
					>
						<Stack spacing={2}>
							{apartmentStats.map((entry) => (
								<Box key={entry.apartment.id}>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										spacing={1}
									>
										<div>
											<Typography
												variant="body2"
												fontWeight={700}
											>
												{entry.apartment.name}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
											>
												{formatCurrency(entry.apartment.pricePerNight)} / noc · {entry.nights}{' '}
												noci prodato
											</Typography>
										</div>
										<Typography
											variant="body2"
											fontWeight={700}
										>
											{formatCurrency(Math.round(entry.revenue))}
										</Typography>
									</Stack>
									<Box
										sx={{
											mt: 0.75,
											height: 6,
											borderRadius: 999,
											backgroundColor: 'action.hover',
											overflow: 'hidden'
										}}
									>
										<Box
											sx={{
												width: `${Math.round(entry.occupancy * 100)}%`,
												height: '100%',
												borderRadius: 999,
												backgroundColor: entry.occupancy >= 0.6 ? '#10b981' : '#f59e0b'
											}}
										/>
									</Box>
								</Box>
							))}
						</Stack>
					</SectionCard>
				</Grid>
			</Grid>
		</Stack>
	);
}
