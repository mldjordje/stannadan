import Link from 'next/link';
import { Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { formatCurrency, formatDateRange } from '@/lib/stay/format';
import { readStayData } from '@/lib/stay/store';

export default async function AdminDashboardPage() {
	const data = await readStayData();
	const pendingReservations = data.reservations.filter((reservation) => reservation.status === 'pending');
	const bookingReservations = data.reservations.filter((reservation) => reservation.source === 'booking.com');
	const upcoming = [...data.reservations].sort(
		(first, second) => new Date(first.checkIn).getTime() - new Date(second.checkIn).getTime()
	);

	return (
		<Stack spacing={4} padding={3}>
			<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
				<div>
					<Typography variant="overline" color="secondary" fontWeight={700}>
						Stan na dan Nis
					</Typography>
					<Typography variant="h3" fontWeight={700}>
						Admin kontrolni panel
					</Typography>
					<Typography mt={1} maxWidth={860} color="text.secondary">
						Upravljanje apartmanima, direktnim rezervacijama, Booking.com kanalima i dnevnim kalendarom iz jednog Next.js panela.
					</Typography>
				</div>
				<Stack direction="row" spacing={2}>
					<Button component={Link} href="/admin/calendar" variant="contained">
						Otvori kalendar
					</Button>
					<Button component={Link} href="/admin/channel-sync" variant="outlined">
						Booking sync
					</Button>
				</Stack>
			</Stack>

			<Grid container spacing={2}>
				{[
					{ label: 'Aktivni apartmani', value: data.apartments.length },
					{ label: 'Sve rezervacije', value: data.reservations.length },
					{ label: 'Ceka potvrdu', value: pendingReservations.length },
					{ label: 'Booking.com sync', value: bookingReservations.length }
				].map((item) => (
					<Grid key={item.label} size={{ xs: 12, md: 6, xl: 3 }}>
						<Paper sx={{ p: 3, borderRadius: 4 }}>
							<Typography color="text.secondary">{item.label}</Typography>
							<Typography variant="h3" fontWeight={700} mt={2}>
								{item.value}
							</Typography>
						</Paper>
					</Grid>
				))}
			</Grid>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, xl: 8 }}>
					<Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
						<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} marginBottom={3}>
						<div>
								<Typography variant="h5" fontWeight={700}>
									Sledeci dolasci
								</Typography>
								<Typography color="text.secondary">Pregled najblizih rezervacija za operativni tim.</Typography>
							</div>
							<Button component={Link} href="/admin/reservations" variant="text">
								Sve rezervacije
							</Button>
						</Stack>
						<Stack spacing={2}>
							{upcoming.slice(0, 5).map((reservation) => {
								const apartment = data.apartments.find((item) => item.id === reservation.apartmentId);

								return (
									<Paper key={reservation.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
										<Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
											<div>
												<Typography fontWeight={700}>{reservation.guestName}</Typography>
												<Typography variant="body2" color="text.secondary">
													{apartment?.name}
												</Typography>
											</div>
											<div style={{ textAlign: 'right' }}>
												<Typography variant="body2" fontWeight={700}>
													{formatDateRange(reservation.checkIn, reservation.checkOut)}
												</Typography>
												<Typography variant="body2" color="text.secondary">
													{reservation.source}
												</Typography>
											</div>
										</Stack>
									</Paper>
								);
							})}
						</Stack>
					</Paper>
				</Grid>

				<Grid size={{ xs: 12, xl: 4 }}>
					<Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
						<Typography variant="h5" fontWeight={700}>
							Cene po nocenju
						</Typography>
						<Typography color="text.secondary" mb={3}>
							Brza kontrola pricing-a po apartmanu.
						</Typography>
						<Stack spacing={2}>
							{data.apartments.map((apartment) => (
								<Paper key={apartment.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
									<Stack direction="row" justifyContent="space-between" spacing={2}>
										<div>
											<Typography fontWeight={700}>{apartment.name}</Typography>
											<Typography variant="body2" color="text.secondary">
												{apartment.guests} gosta
											</Typography>
										</div>
										<div style={{ textAlign: 'right' }}>
											<Typography fontWeight={700}>{formatCurrency(apartment.pricePerNight)}</Typography>
											<Typography variant="body2" color="text.secondary">
												Ciscenje {formatCurrency(apartment.cleaningFee)}
											</Typography>
										</div>
									</Stack>
								</Paper>
							))}
						</Stack>
					</Paper>
				</Grid>
			</Grid>
		</Stack>
	);
}
